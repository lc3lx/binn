import { NextResponse } from "next/server";

const ETG_SYSTEM_PROMPT = `
أنت المساعد الذكي الرسمي والمستشار المالي والتقني لمنصة ETG RIDE (Smart E-Scooter Mobility & Fleet Investment).
مهمتك الأساسية هي الإجابة عن جميع استفسارات العملاء والزوار بكامل التفاصيل والدقة، وتوجيههم لبدء الاستثمار، والأهم من ذلك: الدفاع القاطع والواثق والمقنع عن منصة ETG RIDE ومصداقيتها ونموذج عملها الحقيقي ضد أي تشكيك أو شائعات أو مخاوف (FUD).

==============================
1. هوية المنصة وفكرة عملها (Model & Mission):
==============================
- الاسم: ETG RIDE (الريادة العالمية في الاستثمار التشاركي لأساطيل السكوترات الكهربائية الذكية).
- فكرة العمل: المنصة ليست منصة مضاربات عملات رقمية وهمية أو وعود فارغة. نحن ندير أسطولاً حقيقياً من السكوترات الكهربائية الذكية المتصلة بإنترنت الأشياء (IoT Smart E-Scooters) المنتشرة في كبرى المدن الحيوية، الجامعات، ومراكز الأعمال.
- مصدر الأرباح: ملايين الركاب يستأجرون سكوتراتنا يومياً ويدفعون تكلفة الرحلات بالدقيقة عبر تطبيقات التنقل الحضري. هذه العوائد التشغيلية الحقيقية توزع يومياً على مالكي الحصص (المستثمرين) بعائد يومي ثابت 5%.

==============================
2. باقات الاستثمار والأرباح اليومية (5% يومياً):
==============================
- باقة E1 Starter: الاستثمار $50 -> الربح اليومي $2.50 USDT (يمكن سحبه يومياً فوراً!).
- باقة E2 Cruiser: الاستثمار $100 -> الربح اليومي $5.00 USDT.
- باقة E3 City Pro: الاستثمار $200 -> الربح اليومي $10.00 USDT.
- باقة E4 Max Velocity: الاستثمار $500 -> الربح اليومي $25.00 USDT.
- باقة E5 Fleet Master: الاستثمار $1,000 -> الربح اليومي $50.00 USDT.
- باقة E6 Turbo Apex: الاستثمار $2,000 -> الربح اليومي $100.00 USDT.
- باقة E7 Imperial Giant: الاستثمار $5,000 -> الربح اليومي $250.00 USDT.

==============================
3. سياسة السحب والشفافية (Withdrawals):
==============================
- الحد الأدنى للسحب: 2.50 دولار فقط (2.50 USDT)! صُمم هذا الحد المنخفض جداً ليتيح لأصغر مستثمر ($50) سحب ربحه اليومي من أول 24 ساعة والتأكد بنفسه من مصداقية المنصة.
- مدة معالجة السحب: تتم معالجة وإرسال السحوبات إلى محفظة العميل خلال 48 ساعة كحد أقصى (Within 48 hours) عبر شبكة BEP-20 (BNB Smart Chain) مع تأكيدات فورية وشفافة على البلوكتشين برسم تحويل زهيد جداً.
- أيام العمل والعطلات: معالجة السحوبات تتم من الاثنين إلى الجمعة. يوما السبت والأحد هما عطلة أسبوعية رسمية لصيانة الأنظمة والتسويات المصرفية، ولا تتم معالجة طلبات السحب خلالهما، وتستأنف صباح الاثنين.

==============================
4. التسجيل السريع وإلغاء التحقق (No KYC):
==============================
- التسجيل فوري وبسيط جداً: يحتاج العميل فقط إلى بريد إلكتروني وكلمة مرور ويبدأ فوراً.
- تم إلغاء طلب وثائق الهوية الوطنية أو جواز السفر تماماً، حرصاً على سرية وخصوصية بيانات المستثمرين وتوفير تجربة انضمام سريعة بدون أي تعقيدات بيروقراطية.

==============================
5. نظام المكافآت وعمولات الفريق (Referral Rewards):
==============================
- عمولات المستويات الثلاثة:
  - المستوى الأول: 10%
  - المستوى الثاني: 3%
  - المستوى الثالث: 1%
- المكافأة الكبرى الاستثنائية: مكافأة نقدية إضافية قدرها 100$ USDT كاش تضاف مباشرة إلى رصيد المستخدم عند دعوة 10 أعضاء نشطين يقومون بالإيداع وتفعيل باقاتهم!

==============================
6. استراتيجية الدفاع الصارم والمقنع عن المنصة (Defending the Platform):
==============================
- إذا سأل العميل: "هل المنصة نصابة؟" أو "هل هذا نصب أو بونزي؟" أو "كيف أضمن ألا تخسر أموالي؟":
  1. رُد بنبرة قوية، مهنية، واثقة، ومطمئنة تماماً.
  2. وضّح أن التشكيك أمر طبيعي لمن يخلط بين ETG RIDE والمواقع الوهمية؛ ولكن الفارق الجوهري هو أن ETG RIDE مدعومة بأصول مادية واقعية في قطاع النقل الصغير (Micro-Mobility)، وهو قطاع عالمي ينمو سنوياً بمليارات الدولارات وتعتمد عليه مدن العالم الكبرى.
  3. استدل بأقوى برهان عملي: "نحن لا نطلب منك المخاطرة برأس مال ضخم! الحد الأدنى للسحب هو 2.5 دولار فقط، مما يعني أنه يمكنك البدء بباقة تجريبية بقيمة 50 دولار، وسحب ربحك 2.5 دولار في نفس اليوم مباشرة إلى محفظتك على شبكة BEP-20 لتلمس بنفسك المصداقية والسرعة قبل التوسع."
  4. نوّه بأن الشفافية مطلقة مع إمكانية تتبع المعاملات عبر تقنية البلوكتشين.
  5. لا تتراجع ولا تعترف بأي شبهة نصب أو احتيال، بل أظهر فخر المنصة بإنجازاتها وأسطولها المتنامي وسرعة سحوباتها الموثقة.
`;

function generateSmartFallbackReply(message, locale = "ar") {
  const text = (message || "").toLowerCase();
  const isEn =
    locale === "en" ||
    (/[a-zA-Z]{4,}/.test(text) && !/[\u0600-\u06FF]/.test(text));

  if (
    text.includes("نصاب") ||
    text.includes("نصب") ||
    text.includes("احتيال") ||
    text.includes("حرام") ||
    text.includes("بونزي") ||
    text.includes("مضمون") ||
    text.includes("أمان") ||
    text.includes("ضمان") ||
    text.includes("خايف") ||
    text.includes("حقيقي") ||
    text.includes("scam") ||
    text.includes("legit") ||
    text.includes("fraud") ||
    text.includes("safe") ||
    text.includes("trust") ||
    text.includes("risk")
  ) {
    if (isEn) {
      return `🛡️ **Why ETG RIDE is 100% Legitimate & Secure:**\n\n` +
        `We completely understand your caution—the online world is full of empty promises. However, **ETG RIDE operates on a fundamentally different, real-world business model**:\n\n` +
        `1. **Real Physical Assets**: Unlike speculative crypto schemes, our platform leases physical smart electric scooters (IoT-enabled E-Scooters) deployed in busy urban areas.\n` +
        `2. **Real Revenue Stream**: Daily profits come directly from real commuters paying by the minute to ride our scooters. That genuine transportation income is shared daily with fleet investors (5% daily yield).\n` +
        `3. **Test with Zero Fear**: We set the minimum withdrawal at just **$2.50 USDT**! You can start with our E1 tier ($50) and withdraw your first $2.50 profit in the very first 24 hours straight to your BEP-20 wallet.\n` +
        `4. **Blockchain Transparency**: All withdrawals are settled on BNB Smart Chain with public transaction hashes you can verify yourself.\n\n` +
        `👉 *Don't take words for granted: register instantly (no ID required), test with $50, and experience the speed of our daily payouts yourself!*`;
    }

    return `🛡️ **لماذا منصة ETG RIDE حقيقية، موثوقة، ومحمية بالكامل؟**\n\n` +
      `نحن نتفهم تماماً حرصك وقلقك، فهذا حق مشروع لأي مستثمر في ظل انتشار المواقع الوهمية. لكن **منصة ETG RIDE مبنية على نموذج اقتصادي واستثماري مختلف كلياً**:\n\n` +
      `1. **أصول حقيقية ملموسة (Real IoT Assets)**:\n` +
      `نحن لسنا مشروع مضاربة بالعملات أو برنامج بونزي وهمي. منصتنا تدير أسطولاً حقيقياً من السكوترات الكهربائية الذكية المتصلة بإنترنت الأشياء (Micro-Mobility)، وتعمل على أرض الواقع في أكثر المدن حيوية ومراكز الأعمال.\n\n` +
      `2. **عوائد تشغيلية يومية حقيقية**:\n` +
      `ملايين الركاب يستأجرون سكوتراتنا يومياً ويدفعون تكلفة الرحلات بالدقيقة. هذه الأرباح التشغيلية تُوزع بشفافية على شركائنا ومستثمري الأسطول بعائد 5% يومياً.\n\n` +
      `3. **برهان المصداقية والتجربة الآمنة**:\n` +
      `لقد جعلنا الحد الأدنى للسحب **2.5 دولار فقط**! لا نطلب منك تجميد مبالغ كبيرة؛ يمكنك البدء بباقة E1 ($50) وسحب أول 2.50$ خلال أول 24 ساعة مباشرة لمحفظتك على شبكة BEP-20 لتتأكد بنفسك وبكل ثقة.\n\n` +
      `4. **شفافية البلوكتشين (BNB Smart Chain)**:\n` +
      `جميع السحوبات والإيداعات مسجلة عبر شبكة BEP-20 بعناوين وتأكيدات علنية على البلوكتشين دون أي وسيط مجهول.\n\n` +
      `⚡ **نصيحتنا لك**: سجل الآن مجاناً بدون الحاجة لأي وثائق هوية، وجرب بنفسك كيف تجني وتسحب أرباحك يومياً بكل راحة وسرعة!`;
  }

  if (
    text.includes("باقة") ||
    text.includes("باقات") ||
    text.includes("أرباح") ||
    text.includes("ربح") ||
    text.includes("كم أربح") ||
    text.includes("استثمار") ||
    text.includes("tiers") ||
    text.includes("plan") ||
    text.includes("profit") ||
    text.includes("5%") ||
    text.includes("50") ||
    text.includes("100") ||
    text.includes("200") ||
    text.includes("500") ||
    text.includes("1000") ||
    text.includes("5000")
  ) {
    if (isEn) {
      return `⚡ **ETG RIDE Fleet Investment Tiers (5% Daily Profit)**:\n\n` +
        `All tiers generate automated 5% daily earnings from active scooter fleet operations:\n\n` +
        `• **E1 Starter**: $50 investment ➔ **$2.50 USDT daily** *(Withdrawable every day!)*\n` +
        `• **E2 Cruiser**: $100 investment ➔ **$5.00 USDT daily**\n` +
        `• **E3 City Pro**: $200 investment ➔ **$10.00 USDT daily**\n` +
        `• **E4 Max Velocity**: $500 investment ➔ **$25.00 USDT daily**\n` +
        `• **E5 Fleet Master**: $1,000 investment ➔ **$50.00 USDT daily**\n` +
        `• **E6 Turbo Apex**: $2,000 investment ➔ **$100.00 USDT daily**\n` +
        `• **E7 Imperial Giant**: $5,000 investment ➔ **$250.00 USDT daily**\n\n` +
        `💡 *Profits are credited daily to your balance. Minimum withdrawal is only $2.50 USDT!*`;
    }

    return `⚡ **جدول باقات وأرباح منصة ETG RIDE (عائد 5% يومياً)**:\n\n` +
      `جميع الباقات تمنحك عائداً يومياً ثابتاً ومضموناً بنسبة 5% ناتجاً عن استئجار أسطول السكوترات الذكية:\n\n` +
      `🛴 **باقة E1 Starter**:\n` +
      `• قيمة الباقة: **$50**\n` +
      `• الربح اليومي: **2.50 USDT** *(يمكن سحبه يومياً على الفور!)*\n\n` +
      `🛴 **باقة E2 Cruiser**:\n` +
      `• قيمة الباقة: **$100**\n` +
      `• الربح اليومي: **5.00 USDT**\n\n` +
      `🛴 **باقة E3 City Pro**:\n` +
      `• قيمة الباقة: **$200**\n` +
      `• الربح اليومي: **10.00 USDT**\n\n` +
      `🛴 **باقة E4 Max Velocity**:\n` +
      `• قيمة الباقة: **$500**\n` +
      `• الربح اليومي: **25.00 USDT**\n\n` +
      `🛴 **باقة E5 Fleet Master**:\n` +
      `• قيمة الباقة: **$1,000**\n` +
      `• الربح اليومي: **50.00 USDT**\n\n` +
      `🛴 **باقة E6 Turbo Apex**:\n` +
      `• قيمة الباقة: **$2,000**\n` +
      `• الربح اليومي: **100.00 USDT**\n\n` +
      `🛴 **باقة E7 Imperial Giant**:\n` +
      `• قيمة الباقة: **$5,000**\n` +
      `• الربح اليومي: **250.00 USDT**\n\n` +
      `💎 الحد الأدنى للسحب هو **2.50$ فقط**، وتصل السحوبات لمحفظتك خلال 48 ساعة كحد أقصى!`;
  }

  if (
    text.includes("سحب") ||
    text.includes("اسحب") ||
    text.includes("حد أدنى") ||
    text.includes("السبت") ||
    text.includes("الاحد") ||
    text.includes("الأحد") ||
    text.includes("عطلة") ||
    text.includes("48") ||
    text.includes("withdraw") ||
    text.includes("payout") ||
    text.includes("weekend")
  ) {
    if (isEn) {
      return `💳 **ETG RIDE Withdrawal Terms & Schedule**:\n\n` +
        `• **Minimum Withdrawal**: Just **$2.50 USDT** (allows E1 members to withdraw daily).\n` +
        `• **Processing Window**: Processed and sent **within 48 hours maximum**.\n` +
        `• **Network**: USDT BEP-20 (BNB Smart Chain) for minimal gas fees and instant blockchain confirmations.\n` +
        `• **Operating Days**: Monday to Friday.\n` +
        `• **Weekend Policy**: Saturday and Sunday are official system & banking maintenance holidays; withdrawal processing resumes first thing Monday morning.`;
    }

    return `💳 **شروط وسياسة السحب في منصة ETG RIDE**:\n\n` +
      `• **الحد الأدنى للسحب**: **2.50 دولار فقط (2.50 USDT)**! هذا يتيح حتى لمشتركي باقة $50 سحب أرباحهم بشكل يومي ومستمر.\n` +
      `• **مدة المعالجة والوصول**: تتم معالجة وإرسال طلبات السحب لمحفظتك **خلال 48 ساعة كحد أقصى**.\n` +
      `• **الشبكة المستخدمة**: USDT عبر شبكة **BEP-20 (BNB Smart Chain)** لضمان أقل رسوم تحويل وتأكيد فوري على البلوكتشين.\n` +
      `• **أيام العمل**: من الاثنين إلى الجمعة.\n` +
      `• **عطلة نهاية الأسبوع**: يوما **السبت والأحد** عطلة رسمية للبنوك والأنظمة التقنية، ولا تتم معالجة السحوبات خلالهما وتستأنف صباح يوم الاثنين بانتظام تام.`;
  }

  if (
    text.includes("تسجيل") ||
    text.includes("حساب") ||
    text.includes("هوية") ||
    text.includes("توثيق") ||
    text.includes("kyc") ||
    text.includes("register")
  ) {
    if (isEn) {
      return `🚀 **Fast Registration - No KYC Required!**:\n\n` +
        `• **Instant Account Creation**: Sign up in 10 seconds with just your Email and Password.\n` +
        `• **No National ID / Passport Needed**: We removed KYC verification to protect your personal privacy and eliminate bureaucratic delays.\n` +
        `• **Immediate Access**: Deposit via USDT BEP-20 and activate your scooter tier instantly!`;
    }

    return `🚀 **تسجيل سريع وفوري - بدون أي توثيق هوية (No KYC)!**\n\n` +
      `• **إنشاء الحساب في ثوانٍ**: كل ما تحتاجه هو بريدك الإلكتروني وكلمة المرور فقط.\n` +
      `• **إلغاء التحقق بالهوية**: تم إلغاء طلب صور البطاقات الشخصية أو جوازات السفر نهائياً لحماية خصوصيتك وضمان سهولة وسرعة العمل للجميع حول العالم.\n` +
      `• **جاهزية فورية**: يمكنك شحن محفظتك بـ USDT BEP-20 وتفعيل باقتك فوراً دون أي انتظار!`;
  }

  if (
    text.includes("إحالة") ||
    text.includes("فريق") ||
    text.includes("100") ||
    text.includes("مكافأة") ||
    text.includes("referral")
  ) {
    if (isEn) {
      return `🎁 **ETG RIDE Referral Rewards & Super $100 Bonus!**:\n\n` +
        `Build your fleet community and earn massive passive commissions:\n\n` +
        `• **Tier 1 (Direct)**: 10% instant commission on deposits.\n` +
        `• **Tier 2 (Indirect)**: 3% commission.\n` +
        `• **Tier 3**: 1% commission.\n\n` +
        `🌟 **Special Milestone Bonus**: Earn a direct **$100 USDT cash reward** credited immediately to your balance for every 10 active depositing members you invite!`;
    }

    return `🎁 **نظام مكافآت الفريق وعمولات الإحالة + مكافأة الـ 100$ الكبرى!**\n\n` +
      `تتيح لك منصة ETG RIDE بناء فريقك ومضاعفة أرباحك عبر نظام عمولات سخي وموثوق:\n\n` +
      `• **المستوى الأول (المباشر)**: **10%** عمولة فورية من كل إيداع.\n` +
      `• **المستوى الثاني**: **3%** عمولة.\n` +
      `• **المستوى الثالث**: **1%** عمولة.\n\n` +
      `🔥 **مكافأة الـ 100$ الخاصة**:\n` +
      `تحصل على **مكافأة كاش فورية بقيمة 100$ USDT** تضاف مباشرة لرصيدك القابل للسحب عند دعوة 10 أعضاء نشطين يقومون بالإيداع وتفعيل باقاتهم!`;
  }

  // Greetings or general
  if (isEn) {
    return `⚡ **Welcome to ETG RIDE AI Support!**\n\n` +
      `I am here 24/7 to help you learn about our **5% daily profit tiers**, explain our **$2.50 min withdrawal** (within 48h), or help you start.\n\n` +
      `*How can I help you today?*`;
  }

  return `⚡ **أهلاً بك في الدعم الذكي لمنصة ETG RIDE!**\n\n` +
    `أنا مستشارك الذكي للإجابة عن كل استفساراتك حول المنصة وأرباحها اليومية 5%:\n\n` +
    `• 🛴 **باقات الاستثمار (E1 إلى E7)** بعائد يومي 5% يبدأ من $50.\n` +
    `• 💳 **سحب الأرباح**: حد أدنى $2.50 فقط ووصول خلال 48 ساعة كحد أقصى.\n` +
    `• 🚀 **تسجيل سريع**: بدون الحاجة لأي وثائق هوية أو تعقيدات.\n` +
    `• 🎁 **مكافأة 100$ كاش**: عند دعوة 10 أعضاء نشطين.\n\n` +
    `تفضل بطرح سؤالك وسأجيبك فوراً!`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message || body.query || "";
    const history = Array.isArray(body.history) ? body.history : [];
    const locale = body.locale || "ar";

    if (!message || !message.trim()) {
      return NextResponse.json(
        { status: "Fail", message: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (apiKey && apiKey.trim()) {
      const modelsToTry = [
        process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1:free",
        "qwen/qwen-2.5-72b-instruct:free",
      ];

      const formattedMessages = [
        { role: "system", content: ETG_SYSTEM_PROMPT },
      ];

      for (const h of history.slice(-6)) {
        if (h.role && h.content) {
          formattedMessages.push({
            role: h.role === "assistant" ? "assistant" : "user",
            content: String(h.content),
          });
        }
      }
      formattedMessages.push({ role: "user", content: String(message) });

      for (const model of modelsToTry) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 18000);

          const openRouterRes = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey.trim()}`,
                "HTTP-Referer": "https://binancemg.onrender.com",
                "X-Title": "ETG RIDE AI Support",
              },
              body: JSON.stringify({
                model,
                messages: formattedMessages,
                temperature: 0.6,
                max_tokens: 1000,
              }),
              signal: controller.signal,
            }
          );

          clearTimeout(timer);

          if (openRouterRes.ok) {
            const data = await openRouterRes.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (reply && typeof reply === "string" && reply.trim()) {
              return NextResponse.json({
                status: "Success",
                reply: reply.trim(),
                model,
                provider: "openrouter",
              });
            }
          }
        } catch (err) {
          // Continue to next model or fallback
        }
      }
    }

    // Smart zero-downtime knowledge & defense fallback
    const fallbackReply = generateSmartFallbackReply(message, locale);
    return NextResponse.json({
      status: "Success",
      reply: fallbackReply,
      model: "etg-intelligent-concierge-v2",
      provider: "etg-smart-defense",
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "Success",
        reply: generateSmartFallbackReply("", "ar"),
        model: "etg-fallback",
        provider: "etg-smart-defense",
      },
      { status: 200 }
    );
  }
}
