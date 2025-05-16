document.addEventListener('DOMContentLoaded', () => {
    const swiper = new Swiper('.swiper-container', {
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 5000,
        },
    });

    AOS.init({
        duration: 1000,
        once: true,
    });

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-open');
    });
});

import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// رفع الصور
document.getElementById('upload-portfolio-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const files = document.getElementById('portfolio-pic').files;
    if (!files.length) {
        alert('يرجى اختيار صورة!');
        return;
    }
    const gallery = document.getElementById('portfolio-gallery');
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement('img');
                img.src = reader.result;
                img.alt = file.name;
                gallery.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
    alert('تم رفع الصور بنجاح!');
    e.target.reset();
});

// التسجيل
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        alert('يرجى إدخال بريد إلكتروني صالح!');
        return;
    }
    if (password.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل!');
        return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email.replace(/[<>"'&]/g, ''),
            role,
            createdAt: new Date(),
        });
        alert('تم التسجيل بنجاح!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('خطأ في التسجيل: ' + error.message);
    }
});

// تسجيل الدخول
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        alert('يرجى إدخال بريد إلكتروني صالح!');
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('تم تسجيل الدخول بنجاح!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('خطأ في تسجيل الدخول: ' + error.message);
    }
});

// الدفع
document.getElementById('payment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('amount').value;
    const method = document.getElementById('payment-method').value;
    const orderId = '12345';
    if (method === 'edinar') {
        try {
            const response = await fetch('http://localhost:3000/edinar-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, userId: 'user123' }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert(`تم معالجة دفع ${amount} دينار عبر إي-دينار! رقم العملية: ${data.transactionId}`);
                const emailResponse = await fetch('http://localhost:3000/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: 'user@example.com', orderId }),
                });
                if (emailResponse.ok) alert('تم إرسال تأكيد الطلب إلى بريدك!');
            }
        } catch (error) {
            alert('خطأ في الدفع: ' + error.message);
        }
    } else {
        alert(`تم معالجة دفع ${amount} دينار عبر ${method}!`);
    }
});