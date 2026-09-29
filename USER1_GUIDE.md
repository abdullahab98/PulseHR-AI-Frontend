# User 1: Main Structure & Core Shell

স্বাগতম **User 1 (Core Architect / Lead)**! এই ডিরেক্টরিতে আপনার কাজের জন্য প্রয়োজনীয় সমস্ত ফাইল কপি করা হয়েছে।

## আপনার জন্য কপি করা ফাইলসমূহ:

1. **রুট কনফিগারেশন ফাইলস:**
   - `package.json`, `package-lock.json`
   - `angular.json`, `tsconfig*.json`
   - `tailwind.config.js`, `.editorconfig`, `.gitignore`
   - `README.md`, `INSTRUCTIONS.md`

2. **বেস ফ্রন্টএন্ড অ্যাসেটস (`src/`):**
   - `src/index.html`, `src/main.ts`, `src/styles.css`
   - `src/environments/` (`environment.ts`, `environment.prod.ts`)
   - `src/assets/`, `src/favicon.ico`

3. **অ্যাপ্লিকেশন কোর আর্কিটেকচার (`src/app/`):**
   - **রুট লেআউট:** `app.component.ts`, `app.component.html`, `app.component.css`, `app.component.spec.ts`
   - **কনফিগ ও রাউটিং:** `app.config.ts`, `app.routes.ts`
   - **কমন নেভিগেশন ও শেল কম্পোনেন্টস (`src/app/components/`):**
     - `navbar/` (টপবার, থিম টগল, নোটিফিকেশন, প্রোফাইল ড্রপডাউন)
     - `sidebar/` (মেনু নেভিগেশন, রোল-বেসড মেনু কনফিগ)
     - `ai-assistant-drawer/` (গ্লোবাল এআই অ্যাসিস্ট্যান্ট ড্রয়ার)
   - **সিকিউরিটি ও রাউট গার্ডস (`src/app/guards/`):**
     - `auth.guard.ts` (Login ও Guest রাউট প্রটেকশন)
   - **ইন্টারসেপ্টরস (`src/app/interceptors/`):**
     - `jwt.interceptor.ts` (Bearer Token ইনজেকশন)
   - **মডেলস (`src/app/models/`):**
     - `api.models.ts` (গ্লোবাল ডেটা টাইপস ও ইন্টারফেস)
   - **কোর পেজেস (`src/app/pages/`):**
     - `login/` (অথেন্টিকেশন স্ক্রিন)
     - `dashboard/` (প্রধান এক্সিকিউটিভ ড্যাশবোর্ড)
   - **কোর সার্ভিসেস (`src/app/services/`):**
     - `auth.service.ts` (লগইন, লগআউট, টোকেন ও কারেন্ট ইউজার স্টেট)
     - `theme.service.ts` (ডার্ক/লাইট মোড স্টেট)
     - `api.service.ts` (কমন এইচটিটিপি মেথডস ও বেস ইউআরএল)
     - `dashboard.service.ts` (ড্যাশবোর্ড মেকানিক্স ও মেট্রিক্স)
     - `ai-assistant.service.ts` (এআই ড্রয়ার লজিক)

---

## গিট ব্রাঞ্চ সংক্রান্ত নির্দেশাবলী:

```bash
# আপনার ফিচারের জন্য ব্রাঞ্চ
git checkout -b feature/user1-core-structure

# কাজ শেষে পুশ
git add .
git commit -m "feat(core): setup application shell and auth navigation"
git push -u origin feature/user1-core-structure
```
