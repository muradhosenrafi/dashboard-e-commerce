# ARMANE — Registration, OTP & Login (fixed)

## চালানোর নিয়ম

ZIP extract করে `dashbord` folder VS Code-এ খুলুন:

```bash
npm install
npm run dev
```

আগের Express/MongoDB backend আলাদা terminal-এ চালু রাখবেন। Backend এই ZIP-এ নেই।

- Registration: `http://localhost:5173/` অথবা `/register`
- Login: `http://localhost:5173/login`
- OTP: registration সফল হলে `/otp` নিজে খুলবে।

API address বদলাতে `.env.example` copy করে `.env` তৈরি করুন। আগের API URL ও development Authorization header default হিসেবে আছে। Vite env পরিবর্তনের পরে dev server restart করবেন। VITE_ settings browser-এ প্রকাশিত configuration; backend secret রাখবেন না।

## প্রধান bug কেন হচ্ছিল

Registration page OTP component-এ `onClose` পাঠাচ্ছিল, কিন্তু OTP Back button `onBack()` ডাকছিল। ফলে `onBack is not a function` error হতো। Dialog বন্ধ হলেও parent-এর `otpOpen` true থাকত এবং submit button disabled থাকত।

এখন `/otp` একটি আলাদা route। Back button বা Escape registration route-এ ফেরত যায়। Form-এ কোনো stale modal lock নেই। একই pending email-এর জন্য আবার user তৈরি না করে আগের OTP panel খোলে। অন্য email দিলে নতুন registration request যায়। Browser refresh প্রয়োজন নেই।

## কী ঠিক করা হয়েছে

- Same email + active OTP → **Continue verification**, duplicate registration POST হয় না।
- Back-এর পরে নতুন email → নতুন registration; আগের pending email-ও resume করা যায়।
- Escape, browser Back/Forward, `/register` route এবং header/footer links কাজ করে।
- Refresh হলেও original `otpExpiresAt` অপরিবর্তিত থাকে। Server থেকে ৩০ সেকেন্ডের deadline এলে সেই deadline-ই ব্যবহার হয়; client সময় বাড়ায় না।
- OTP expire হলে verification button/input disabled হয়। Back করা যায়।
- 320px mobile screen-এও OTP panel-এর Back button দৃশ্যমান রাখতে spacing compact করা হয়েছে।
- OTP success হলে শুধু ওই email-এর pending metadata সরিয়ে Login-এ যায়।
- Direct `/otp`-তে pending registration না থাকলে registration-এ নিরাপদে ফেরত আসে।
- Blank fields, invalid email, short password ও mismatched confirmation API call-এর আগে আটকায়।
- Login validation এখন boolean ফেরত দেয়; invalid form আর request পাঠায় না।
- HTTP 200-তে error text বা `success: false` এলেও fake login/OTP success দেখায় না।
- JSON ও plain-text server errors UI-তে দেখায়।
- Double-submit আটকানো, ১৫ সেকেন্ড request timeout এবং navigation-এর সময়ে পুরোনো request cancellation আছে।
- Pending email ও expiry শুধু tab-এর sessionStorage-এ রাখা হয়; password/OTP/token নয়। Storage unavailable হলে same-page memory fallback আছে।

## Backend response contract

### Registration: `POST /registration`

Request: `{ "username": "Your name", "email": "you@example.com", "password": "..." }`

সফল save-এর পরে:

```js
return res.status(201).json({
  success: true,
  message: "Registration successful! Please verify your email.",
  email: data.email,
  otpExpiresAt: data.otpExpiresAt,
});
```

`otpExpiresAt` হবে ISO date string। ৩০ সেকেন্ডের মেয়াদ backend-এ:

```js
const otpExpiresAt = new Date(Date.now() + 30 * 1000);
```

Verified/existing email-এর জন্য `409` এবং `{ success: false, message: "This email already exists." }` দিন। Plain text error response-ও UI দেখাতে পারে। Normalized email (`trim().toLowerCase()`) দিয়ে lookup ও save করুন এবং unique index রাখুন।

এই tab-এ আগে সফল registration না হলে শুধু "email exists" লেখা দেখে frontend verified/unverified আলাদা করতে পারে না। অন্য tab/device-এর pending account resume করতে backend স্পষ্ট status দিতে পারে:

```js
return res.status(409).json({
  success: false,
  code: "EMAIL_NOT_VERIFIED",
  email: existingUser.email,
  otpExpiresAt: existingUser.otpExpiresAt,
  message: "Please verify your email.",
});
```

### Verification: `POST /verify-otp`

Request: `{ "email": "you@example.com", "otp": "012345" }`। OTP string হিসেবেই পাঠানো হয়, যাতে শুরুর `0` না হারায়।

Success: `{ "success": true, "message": "Email verified successfully" }`। Wrong OTP-তে error status ও message দিন। Expired OTP-তে `410` অথবা `{ "success": false, "code": "OTP_EXPIRED", "message": "OTP expired" }` দিন। Backend-এ অবশ্যই deadline, hash ও attempt limits যাচাই করতে হবে। Frontend timer authentication-এর প্রমাণ নয়।

Verification সফল হলে backend `isVerified: true` করবে এবং `otpHash`/`otpExpiresAt` unset করবে।

### Login: `POST /login`

Success হলে `{ "success": true }` দিন। Invalid credentials হলে error status ও message দিন। পুরোনো controller যদি success flag ছাড়া user document বা শুধু string ফেরত দেয়, সেটি এই contract অনুযায়ী বদলাতে হবে। এই ZIP login success message দেখায়; backend session/token management বা dashboard তৈরি করে না।

## OTP expire ও automatic user delete

Frontend expired code দিয়ে verify আটকে দেয়। Database document delete করে backend-এর TTL index। MongoDB cleanup কিছুটা পরে হতে পারে। Expired pending email দিয়ে আবার registration করলে server এখনও "email exists" বলতে পারে; এটি frontend lock নয়।

তাৎক্ষণিক re-registration চাইলে backend expired **unverified** record conditionalভাবে delete করে আবার existing-email check করতে হবে। Verified user delete করবেন না। Duplicate prevention-এর জন্য unique email index রাখা প্রয়োজন। Backend source ZIP-এ না থাকায় এখানে সেই code পরিবর্তন করা হয়নি।

OTP ইমেইলে পাঠানোও backend-এর কাজ। এই ZIP email delivery বা resend endpoint যোগ করে না। Server expiry না দিলে UI নতুন deadline বানায় না; expiry server যাচাই করে।

## Checks

```bash
npm test
npm run lint
npm run build
```

Unit checks validation, duplicate-resume metadata, exact expiry boundary ও credential-free session storage যাচাই করে। ১২টি unit test ও ২৮টি browser scenario যাচাই করা হয়েছে। Browser interaction checks mock API responses দিয়ে করা হয়েছে; আপনার live MongoDB/email backend এই পরীক্ষায় ব্যবহার করা হয়নি।

Production-এ `/register`, `/login` ও `/otp` reload কাজ করাতে SPA fallback to `index.html` দিন।

## পরিবর্তিত ফাইল

- `src/Registion.jsx` — register/resume flow
- `src/OtpModal.jsx` — controlled Back callback, expiry, verification
- `src/OtpPage.jsx` — guarded OTP route ও successful verification navigation
- `src/login.jsx` — validation, truthful API success/error
- `src/App.jsx`, `src/components/AuthLayout.jsx` — valid routes ও Link navigation
- `src/components/useAuthForm.js` — reusable validation result
- `src/components/useExpiry.js` — absolute deadline countdown
- `src/components/FormField.jsx` — disabled password toggle
- `src/lib/*` — API configuration, validation ও pending verification metadata
- `tests/auth.test.js` — regression tests

Visual design, colors এবং responsive layout রাখা হয়েছে।
