import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Saat dideploy ke Firebase App Hosting, SDK secara otomatis akan
// mengambil kredensial akun layanan yang diperlukan.
if (!getApps().length) {
  admin.initializeApp();
}

export async function POST(request: Request) {
  try {
    const { title, content, targetUserId, excludeUserId, link } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Judul atau konten tidak ditemukan' }, { status: 400 });
    }

    const db = admin.firestore();
    const tokens: string[] = [];

    if (targetUserId) {
        const userDoc = await db.collection('users').doc(targetUserId).get();
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData && userData.fcmToken) {
                tokens.push(userData.fcmToken);
            }
        }
    } else {
        const usersSnapshot = await db.collection('users').get();
        usersSnapshot.forEach(doc => {
          if (doc.id === excludeUserId) {
              return;
          }
          const userData = doc.data();
          // Pastikan pengguna memiliki token FCM yang valid
          if (userData.fcmToken) {
            tokens.push(userData.fcmToken);
          }
        });
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'Tidak ada pengguna dengan token notifikasi.' });
    }

    const message = {
      notification: {
        title: title,
        body: content,
      },
      webpush: {
        fcm_options: {
          link: link || '/dashboard/announcements'
        }
      },
      tokens: tokens,
    };
    
    const response = await admin.messaging().sendEachForMulticast(message as any);
    
    console.log(`${response.successCount} pesan berhasil dikirim`);
    
    // Opsional: Bersihkan token yang tidak valid
    if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(tokens[idx]);
            }
        });
        console.log('Daftar token yang gagal: ' + failedTokens);
    }

    return NextResponse.json({ success: true, count: response.successCount });
  } catch (error) {
    console.error('Gagal mengirim notifikasi:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
