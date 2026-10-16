/* =============================================================
   SUJAL PHYSIO — Chatbot JavaScript
   File: js/chatbot.js

   A fully rule-based, client-side service-assistant chatbot.
   No external AI API required. No data is sent to any server.

   Features:
     - Service keyword matching with scoring
     - Emergency & medical safety responses
     - Per-service WhatsApp pre-filled enquiry links
     - Typing indicator (750 ms delay)
     - Quick-reply buttons (auto-populated after each response)
     - Keyboard: Enter to send, Escape to close
     - Unread badge on trigger button
     - Accessible: aria-live, aria-expanded, aria-modal,
       focus management, focus-visible outlines
     - Respects prefers-reduced-motion (via CSS)
   ============================================================= */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG
  ---------------------------------------------------------- */
  const WA_NUMBER = '918511057556';
  const WA_BASE   = 'https://wa.me/' + WA_NUMBER + '?text=';

  /* ----------------------------------------------------------
     DOM REFERENCES
  ---------------------------------------------------------- */
  const trigger  = document.getElementById('cbTrigger');
  const panel    = document.getElementById('cbPanel');
  const closeBtn = document.getElementById('cbClose');
  const messages = document.getElementById('cbMessages');
  const qrWrap   = document.getElementById('cbQRWrap');
  const input    = document.getElementById('cbInput');
  const sendBtn  = document.getElementById('cbSend');
  const badge    = document.getElementById('cbBadge');

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */
  let isOpen           = false;
  let typingTimer      = null;
  let lastActiveService = null;  /* remembers last matched service for "Enquire" QR */

  /* ----------------------------------------------------------
     KNOWLEDGE BASE
     Six service objects, each with:
       id          – internal key
       label       – display name used in WhatsApp messages
       keywords    – words/phrases matched against user input
       description – HTML shown in the bot bubble
  ---------------------------------------------------------- */
  const SERVICES = [
    {
      id: 'posture',
      label: 'Posture & Ergonomic Guidance',
      keywords: [
        'posture', 'ergonomic', 'sitting', 'desk', 'back pain', 'neck pain',
        'spine', 'slouch', 'workstation', 'office', 'chair', 'screen',
        'alignment', 'hunchback', 'rounded shoulder',
      ],
      description:
        'I offer <strong>Posture & Ergonomic Guidance</strong> — practical advice on ' +
        'correcting postural imbalances and setting up your workspace to reduce strain. ' +
        'Ideal for people who spend long hours sitting at a desk.',
    },
    {
      id: 'mobility',
      label: 'Mobility & Flexibility Exercise Guidance',
      keywords: [
        'mobility', 'flexibility', 'stiff', 'stiffness', 'range of motion',
        'joint', 'tight', 'loosen', 'bend', 'flexibility exercise',
        'movement', 'stretch out', 'range',
      ],
      description:
        'I provide <strong>Mobility & Flexibility Exercise Guidance</strong> — structured ' +
        'exercises designed to improve joint range of motion and overall body flexibility, ' +
        'tailored to your individual needs under qualified supervision.',
    },
    {
      id: 'stretching',
      label: 'Stretching & Exercise Guidance',
      keywords: [
        'stretch', 'stretching', 'exercise', 'muscle', 'tension', 'cool',
        'tightness', 'flexibility training', 'physical exercise',
        'workout', 'fitness', 'pain relief exercise',
      ],
      description:
        'I offer <strong>Stretching & Exercise Guidance</strong> — safe and effective ' +
        'stretching protocols and therapeutic exercise programmes to maintain muscle health, ' +
        'reduce tension, and enhance physical performance.',
    },
    {
      id: 'sports',
      label: 'Sports Warm-up Guidance',
      keywords: [
        'sport', 'sports', 'warm up', 'warm-up', 'warmup', 'athlete',
        'run', 'running', 'football', 'cricket', 'gym', 'training',
        'pre-game', 'injury prevention', 'performance', 'active',
      ],
      description:
        'I provide <strong>Sports Warm-up Guidance</strong> — evidence-based pre-activity ' +
        'routines to prepare your muscles and joints for sport, reducing injury risk and ' +
        'optimising athletic performance.',
    },
    {
      id: 'general',
      label: 'General Mobility Support',
      keywords: [
        'daily', 'walk', 'walking', 'functional', 'independence',
        'lifestyle', 'active life', 'day to day', 'everyday',
        'general mobility', 'move better', 'elderly', 'senior', 'basic movement',
      ],
      description:
        'I offer <strong>General Mobility Support</strong> — personalised guidance to improve ' +
        'daily functional movement, help you stay independent, and support an active ' +
        'lifestyle safely.',
    },
    {
      id: 'rehab',
      label: 'Supervised Rehabilitation Activities',
      keywords: [
        'rehab', 'rehabilitation', 'recovery', 'recover',
        'post surgery', 'post-surgery', 'return to sport',
        'restore', 'fracture', 'sprain', 'strain', 'supervised', 'therapy',
      ],
      description:
        'I provide <strong>Supervised Rehabilitation Activities</strong> — guided rehabilitation ' +
        'exercises conducted under qualified supervision to aid your recovery and support your ' +
        'return to daily activities.',
    },
  ];

  /* ----------------------------------------------------------
     SAFETY KEYWORD LISTS
     Emergency is checked first (highest priority).
     Medical symptoms trigger a safety redirect message.
  ---------------------------------------------------------- */
  const EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'stroke', 'paralysis',
    'paralysed', 'paralyzed', 'cannot breathe', "can't breathe",
    'difficulty breathing', 'unconscious', 'fainted',
    'collapse', 'collapsed', 'severe pain', 'sudden weakness',
    "can't move", 'cannot move', 'emergency',
  ];

  const MEDICAL_KEYWORDS = [
    'pain', 'ache', 'aching', 'hurt', 'hurts', 'sore', 'soreness',
    'numb', 'numbness', 'tingling', 'weak', 'weakness',
    'swollen', 'swelling', 'inflammation', 'spasm', 'cramp',
    'fracture', 'broken bone', 'diagnosis', 'diagnose',
    'treat', 'treatment', 'medicine', 'medication', 'tablet', 'drug',
    'doctor', 'symptoms', 'chronic', 'acute', 'disease', 'condition',
    'surgery', 'operation', 'nerve', 'disc', 'sciatica',
    'arthritis', 'osteoporosis', 'degenerative', 'slipped',
    'herniated', 'carpal tunnel', 'plantar',
  ];

  /* ----------------------------------------------------------
     OTHER INTENT KEYWORD LISTS
  ---------------------------------------------------------- */
  const GREETING_KEYWORDS = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon',
    'good evening', 'namaste', 'kem cho', 'helo',
  ];

  const THANKS_KEYWORDS = [
    'thank', 'thanks', 'thank you', 'thankyou', 'thx', 'ty',
  ];

  const CONTACT_KEYWORDS = [
    'contact', 'whatsapp', 'call', 'email', 'book',
    'appointment', 'number', 'phone', 'reach',
  ];

  const ABOUT_KEYWORDS = [
    'who are you', 'about you', 'about sujal', 'qualification',
    'bpt', 'b.p.t', 'student', 'college', 'cu shah', 'c.u.shah',
    'physiotherapist',
  ];

  /* ----------------------------------------------------------
     CLASSIFICATION ENGINE
     Returns { type, svc? }
     type: 'emergency' | 'medical' | 'greeting' | 'thanks' |
           'about'     | 'contact' | 'service'  | 'unknown'
  ---------------------------------------------------------- */
  function classify(text) {
    const t = text.toLowerCase();

    /* Priority 1 — Emergency */
    if (EMERGENCY_KEYWORDS.some(k => t.includes(k))) return { type: 'emergency' };

    /* Priority 2 — Medical symptoms */
    if (MEDICAL_KEYWORDS.some(k => t.includes(k))) return { type: 'medical' };

    /* Priority 3 — Greeting */
    if (GREETING_KEYWORDS.some(k => t.includes(k))) return { type: 'greeting' };

    /* Priority 4 — Thanks */
    if (THANKS_KEYWORDS.some(k => t.includes(k))) return { type: 'thanks' };

    /* Priority 5 — About/qualifications */
    if (ABOUT_KEYWORDS.some(k => t.includes(k))) return { type: 'about' };

    /* Priority 6 — Contact */
    if (CONTACT_KEYWORDS.some(k => t.includes(k))) return { type: 'contact' };

    /* Priority 7 — Service match (scored; highest wins) */
    const scored = SERVICES
      .map(svc => ({ svc, score: svc.keywords.filter(k => t.includes(k)).length }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) return { type: 'service', svc: scored[0].svc };

    return { type: 'unknown' };
  }

  /* ----------------------------------------------------------
     RESPONSE BUILDER
     Returns { text, qrs[], waBtn? }
  ---------------------------------------------------------- */
  function buildResponse(classification) {
    switch (classification.type) {

      case 'emergency':
        return {
          text: '🚨 <strong>This sounds like it may need urgent attention.</strong> ' +
                'Please contact local emergency services or go to your nearest hospital ' +
                'immediately. Do not delay seeking help.',
          qrs: [],
        };

      case 'medical':
        return {
          text: "I'm not able to assess or advise on medical symptoms, injuries, or " +
                'conditions. For any health concern, please consult a ' +
                '<strong>registered physiotherapist or qualified healthcare professional</strong>.' +
                '<br><br>I can help you explore the <em>service categories</em> available — ' +
                'would you like to see those?',
          qrs: ['View all services', 'Contact Sujal directly'],
        };

      case 'greeting':
        return {
          text: 'Hello! 👋 Welcome to Sujal Physio.<br><br>' +
                'I can help you find the right service category for your needs. ' +
                'What would you like to know about?',
          qrs: mainMenu(),
        };

      case 'thanks':
        return {
          text: "You're very welcome! 😊 Feel free to reach out anytime — Sujal is happy to help." +
                '<br><br>Is there anything else I can assist you with?',
          qrs: ['View all services', 'Contact Sujal directly'],
        };

      case 'about':
        return {
          text: '<strong>Makwana Sujal Hiteshbhai</strong> is a final-year Bachelor of ' +
                'Physiotherapy (B.P.T.) student at <em>C. U. Shah Physiotherapy College</em>.' +
                '<br><br>All guidance services are provided within the appropriate scope of ' +
                'supervised student practice and are <strong>not</strong> independent ' +
                'clinical practice.',
          qrs: ['View all services', 'Contact Sujal directly'],
        };

      case 'contact':
        return {
          text: 'You can reach Sujal directly:<br><br>' +
                '📱 <strong>WhatsApp / Phone:</strong> +91 85110 57556<br>' +
                '📧 <strong>Email:</strong> makwanasujal27@gmail.com<br><br>' +
                'Tap the button below to start a WhatsApp conversation.',
          qrs: [],
          waBtn: {
            label: 'Open WhatsApp',
            text: 'Hello Sujal, I visited your website and would like to get in touch.',
          },
        };

      case 'service':
        return {
          text: classification.svc.description +
                '<br><br><em>Note: This is a service navigation suggestion — ' +
                'not a clinical recommendation.</em>',
          qrs: ['Enquire about this service', 'View all services', 'Contact Sujal directly'],
          activeService: classification.svc,
        };

      case 'unknown':
      default:
        return {
          text: "I'm not sure I understood that. Here's what I can help with — " +
                'please choose an option or type your question:',
          qrs: mainMenu(),
        };
    }
  }

  /* ----------------------------------------------------------
     MAIN MENU QUICK REPLIES
  ---------------------------------------------------------- */
  function mainMenu() {
    return [
      'Posture & ergonomics',
      'Mobility & flexibility',
      'Stretching & exercise',
      'Sports warm-up',
      'General mobility',
      'Supervised rehabilitation',
      'Contact Sujal',
    ];
  }

  /* ----------------------------------------------------------
     MAP QUICK-REPLY LABELS TO TEXT FOR THE CLASSIFIER
  ---------------------------------------------------------- */
  function qrToText(label) {
    const map = {
      'posture & ergonomics':      'posture ergonomic guidance',
      'mobility & flexibility':    'mobility flexibility exercise',
      'stretching & exercise':     'stretching exercise guidance',
      'sports warm-up':            'sports warm-up guidance',
      'general mobility':          'general mobility support',
      'supervised rehabilitation': 'supervised rehabilitation activities',
      'contact sujal':             'contact whatsapp',
      'contact sujal directly':    'contact whatsapp',
      'view all services':         'hello services menu',
      'enquire about this service': '__enquire__',
    };
    return map[label.toLowerCase()] || label;
  }

  /* ----------------------------------------------------------
     RENDER: Add a message bubble
     who: 'bot' | 'user'
  ---------------------------------------------------------- */
  function addMessage(html, who) {
    const msg = document.createElement('div');
    msg.className = 'cb-msg ' + who;

    /* Bot avatar icon */
    if (who === 'bot') {
      const icon = document.createElement('div');
      icon.className = 'cb-bot-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="12" cy="7" r="4"/></svg>';
      msg.appendChild(icon);
    }

    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    bubble.innerHTML = html;          /* HTML is trusted (bot) or escaped (user) */
    msg.appendChild(bubble);

    messages.appendChild(msg);
    scrollBottom();
    return msg;
  }

  /* ----------------------------------------------------------
     RENDER: WhatsApp action button below a bot message
  ---------------------------------------------------------- */
  const WA_ICON_PATH =
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
    '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463' +
    '-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606' +
    '.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025' +
    '-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008' +
    '-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0' +
    ' 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262' +
    '.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413' +
    '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h' +
    '-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374' +
    'a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122' +
    ' 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885' +
    ' 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892' +
    'c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683' +
    ' 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z';

  function addWAButton(label, waText) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:0 14px 10px;';

    const btn = document.createElement('a');
    btn.className = 'cb-wa-btn';
    btn.href      = WA_BASE + encodeURIComponent(waText);
    btn.target    = '_blank';
    btn.rel       = 'noopener noreferrer';
    btn.setAttribute('aria-label', label + ' on WhatsApp');
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="' + WA_ICON_PATH + '"/></svg> ' + label;

    wrap.appendChild(btn);
    messages.appendChild(wrap);
    scrollBottom();
  }

  /* ----------------------------------------------------------
     RENDER: Typing indicator (three bouncing dots)
  ---------------------------------------------------------- */
  function showTyping() {
    const msg = document.createElement('div');
    msg.className = 'cb-msg bot cb-typing';
    msg.id = 'cb-typing';

    const icon = document.createElement('div');
    icon.className = 'cb-bot-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="12" cy="7" r="4"/></svg>';
    msg.appendChild(icon);

    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble';
    bubble.innerHTML =
      '<span class="cb-dot"></span>' +
      '<span class="cb-dot"></span>' +
      '<span class="cb-dot"></span>';
    msg.appendChild(bubble);

    messages.appendChild(msg);
    scrollBottom();
  }

  function removeTyping() {
    const t = document.getElementById('cb-typing');
    if (t) t.remove();
  }

  /* ----------------------------------------------------------
     RENDER: Quick reply buttons
  ---------------------------------------------------------- */
  function setQRs(labels) {
    qrWrap.innerHTML = '';
    labels.forEach(label => {
      const btn = document.createElement('button');
      btn.className   = 'cb-qr';
      btn.textContent = label;
      btn.addEventListener('click', () => handleUserInput(label));
      qrWrap.appendChild(btn);
    });
  }

  /* ----------------------------------------------------------
     SCROLL MESSAGES TO BOTTOM
  ---------------------------------------------------------- */
  function scrollBottom() {
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  /* ----------------------------------------------------------
     CONVERSATION HANDLER
     Called for both typed text and quick-reply clicks.
  ---------------------------------------------------------- */
  function handleUserInput(text) {
    /* Clear QRs and input immediately */
    setQRs([]);
    input.value = '';

    /* Render user bubble (HTML-escaped) */
    addMessage(escapeHtml(text), 'user');

    /* Special case: "Enquire about this service" QR */
    if (text.toLowerCase() === 'enquire about this service' && lastActiveService) {
      const waMsg =
        'Hello, I visited your website and would like to enquire about ' +
        lastActiveService.label + '. Please share the available information.';
      addWAButton('Enquire: ' + lastActiveService.label, waMsg);
      setQRs(['View all services', 'Contact Sujal directly']);
      return;
    }

    /* Show typing indicator, then classify & respond */
    showTyping();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      removeTyping();

      const mapped   = qrToText(text);
      const result   = classify(mapped === '__enquire__' ? 'enquire' : mapped);
      const response = buildResponse(result);

      /* Track last matched service for the "Enquire" QR */
      if (result.type === 'service') lastActiveService = result.svc;

      addMessage(response.text, 'bot');

      if (response.waBtn) {
        addWAButton(response.waBtn.label, response.waBtn.text);
      }

      setQRs(response.qrs || []);
    }, 750);
  }

  /* ----------------------------------------------------------
     HTML ESCAPE — used for user-submitted text
  ---------------------------------------------------------- */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ----------------------------------------------------------
     PANEL OPEN / CLOSE
  ---------------------------------------------------------- */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    badge.classList.add('hidden');
    /* Move focus to input after transition */
    setTimeout(() => input.focus(), 260);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    /* Return focus to trigger */
    trigger.focus();
  }

  trigger.addEventListener('click', () => { isOpen ? closePanel() : openPanel(); });
  closeBtn.addEventListener('click', closePanel);

  /* Escape key closes the panel */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ----------------------------------------------------------
     SEND MESSAGE
  ---------------------------------------------------------- */
  function trySend() {
    const text = input.value.trim();
    if (!text) return;
    handleUserInput(text);
  }

  sendBtn.addEventListener('click', trySend);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); trySend(); }
  });

  /* ----------------------------------------------------------
     INITIALISE — show welcome message
  ---------------------------------------------------------- */
  addMessage(
    'Hello! 👋 Welcome to <strong>Sujal Physio</strong>.<br><br>' +
    'I can help you explore the available physiotherapy guidance services. ' +
    'What would you like to know about?',
    'bot'
  );
  setQRs(mainMenu());

})();
