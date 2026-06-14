import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MidtransNotification = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      transaction_status,
      fraud_status,
      signature_key,
    } = body;

    // 1. Signature Key Verification
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY env variable is not configured.');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const payloadToHash = order_id + status_code + gross_amount + serverKey;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(payloadToHash)
      .digest('hex');

    if (calculatedSignature !== signature_key) {
      console.warn(`Unauthorized Webhook Attempt. Invalid signature for order: ${order_id}`);
      return NextResponse.json(
        { error: 'Invalid signature key' },
        { status: 401 }
      );
    }

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createAdminClient();

    // 3. Mapping Payment Gateway Status
    let newStatus: 'pending' | 'lunas' | 'failed' | 'expired' = 'pending';

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newStatus = 'lunas';
      } else {
        newStatus = 'failed';
      }
    } else if (transaction_status === 'settlement') {
      newStatus = 'lunas';
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny'
    ) {
      newStatus = 'failed';
    } else if (transaction_status === 'expire') {
      newStatus = 'expired';
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    }

    console.log(`Processing Order ${order_id}. Midtrans Status: ${transaction_status}. Mapped Status: ${newStatus}`);

    // 4. Update pembayaran Table
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('pembayaran')
      .update({
        status_bayar: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id_transaksi', order_id)
      .select('user_id, jenis_tagihan')
      .single();

    if (paymentError) {
      console.error(`Failed to update payment status for Order ${order_id}:`, paymentError.message);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    // 5. Automatic verification if registration fee is paid
    if (newStatus === 'lunas' && paymentRecord?.jenis_tagihan === 'pendaftaran') {
      const { error: studentUpdateError } = await supabaseAdmin
        .from('calon_siswa')
        .update({
          status_kelulusan: 'Terverifikasi',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.user_id);

      if (studentUpdateError) {
        console.error(
          `Failed to automatically verify student profile for User ID ${paymentRecord.user_id}:`,
          studentUpdateError.message
        );
      } else {
        console.log(`Student registration verified automatically for User ID: ${paymentRecord.user_id}`);
      }
    }

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
