'use server';

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
  admin.initializeApp();
}

const reminderMessages = [
    { title: "⏰ Jangan Lupa Cek Stok!", content: "Haloo, jangan lupa cek stok produk kamu yaa. Pastikan semuanya aman terkendali! 👍" },
    { title: "🔔 Waktunya Cek Produk!", content: "Udah saatnya produk kamu dicek sekarang! Yuk, pastikan tidak ada yang kehabisan. 🍰" },
    { title: "👀 Jangan Tidur Dulu!", content: "Hayo jangan tidur dulu, cek stok produk dulu. Biar besok pagi tenang! ✨" },
    { title: "🧐 Stok Check!", content: "Sudah satu jam berlalu, yuk luangkan waktu sejenak untuk memeriksa stok produkmu! 📦" }
];

export async function GET() {
    try {
        const db = admin.firestore();
        const usersSnapshot = await db.collection('users').get();
        const tokens: string[] = [];

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.fcmToken) {
                tokens.push(userData.fcmToken);
            }
        });

        if (tokens.length === 0) {
            return NextResponse.json({ success: true, message: 'Tidak ada pengguna dengan token notifikasi untuk dikirimi pengingat.' });
        }

        const randomIndex = Math.floor(Math.random() * reminderMessages.length);
        const { title, content } = reminderMessages[randomIndex];

        const message = {
            notification: {
                title: title,
                body: content,
            },
            webpush: {
                fcm_options: {
                    link: '/dashboard'
                }
            },
            tokens: tokens,
        };
        
        const response = await admin.messaging().sendEachForMulticast(message as any);
        
        console.log(`Pengingat stok berhasil dikirim ke ${response.successCount} pengguna.`);
        
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            console.log('Daftar token yang gagal: ' + failedTokens);
        }

        return NextResponse.json({ success: true, message: `Pesan pengingat berhasil dikirim ke ${response.successCount} pengguna.` });

    } catch (error) {
        console.error('Gagal mengirim notifikasi pengingat:', error);
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
