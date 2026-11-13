import React, { useState } from 'react';
import { Smartphone, Send, PhoneCall, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';
import { MOCK_ADDRESSES } from '../data/mockData';

export const UssdQuickLookupView: React.FC = () => {
  const [ussdDial, setUssdDial] = useState('*282#');
  const [dialStep, setDialStep] = useState<'idle' | 'menu' | 'result'>('idle');
  const [codeInput, setCodeInput] = useState('SDAS-MOG-7482');
  const [ussdOutput, setUssdOutput] = useState('');

  const [smsQuery, setSmsQuery] = useState('SDAS-MOG-7482');
  const [smsResponses, setSmsResponses] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'SDAS-GOV',
      text: 'Ku soo dhowow Adeegga Ciwaanka Dijitaalka ah ee Muqdisho. Si aad u hesho macluumaadka goobta, u soo dir koodhka lambarka 282.',
      time: '10:00'
    }
  ]);

  const handleDialUssd = (e: React.FormEvent) => {
    e.preventDefault();
    setDialStep('menu');
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_ADDRESSES.find((a) => a.publicCode.toLowerCase() === codeInput.trim().toLowerCase());
    if (found) {
      setUssdOutput(
        `SDAS GOV: ${found.publicCode}\n` +
        `Degmada: ${found.components.district}\n` +
        `Xaafadda: ${found.components.locality}\n` +
        `Wadada: ${found.components.street || 'Wadada Weyn'}\n` +
        `GPS: ${found.location.coordinates[1].toFixed(4)}N, ${found.location.coordinates[0].toFixed(4)}E\n` +
        `Xaaladda: Xaqiijiyay (Official)`
      );
    } else {
      setUssdOutput('SDAS GOV: Koodhka lama helin. Fadlan hubi koodhka saxda ah ama wac 112.');
    }
    setDialStep('result');
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    const query = smsQuery.trim();
    if (!query) return;

    const newMsgs = [
      ...smsResponses,
      { sender: 'You', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];

    const found = MOCK_ADDRESSES.find((a) => a.publicCode.toLowerCase() === query.toLowerCase());
    setTimeout(() => {
      if (found) {
        setSmsResponses([
          ...newMsgs,
          {
            sender: 'SDAS-GOV',
            text: `[SDAS] Ciwaanka: ${found.publicCode}. Degmada: ${found.components.district}, Xaafadda: ${found.components.locality}, Wadada: ${found.components.street || 'N/A'}. Xaqiijiyay BRA.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setSmsResponses([
          ...newMsgs,
          {
            sender: 'SDAS-GOV',
            text: `[SDAS] Ma jiro ciwaan ku diiwaangashan koodhkan "${query}". Fadlan booqo xafiiska degmadaada ama address.gov.so.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 600);

    setSmsResponses(newMsgs);
    setSmsQuery('');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-2">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Adeegga Dadweynaha ee Mobilka (SMS & USSD *282#)
        </h2>
        <p className="text-xs text-slate-500">
          Sida ku xusan Qaybta 8.6 ee Master Blueprint v3.0, muwaadiniinta aan haysan taleefannada smart-ka ah waxay ciwaanada ka heli karaan adeegga tooska ah ee USSD (*282#) iyo fariimaha gaagaaban ee SMS (282).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* USSD Phone Simulator */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm">USSD Gateway (*282#)</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono ml-auto">
              Hormuud / Somtel
            </span>
          </div>

          {/* Interactive Feature Phone Mockup */}
          <div className="max-w-xs mx-auto bg-slate-900 rounded-3xl p-3.5 sm:p-5 border-4 border-slate-700 shadow-xl space-y-4 text-white">
            <div className="bg-slate-800 rounded-xl p-4 min-h-[220px] font-mono text-xs flex flex-col justify-between border border-slate-700">
              {dialStep === 'idle' && (
                <div className="space-y-3 my-auto text-center">
                  <div className="text-slate-400 text-[11px]">Geli lambarka adeegga:</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono tracking-widest">{ussdDial}</div>
                  <button
                    onClick={() => setDialStep('menu')}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-xs transition cursor-pointer"
                  >
                    Wac (Dial)
                  </button>
                </div>
              )}

              {dialStep === 'menu' && (
                <form onSubmit={handleSendCode} className="space-y-3">
                  <div className="text-amber-300 font-semibold text-[11px] border-b border-slate-700 pb-1">
                    SDAS GOBOLKA BANAADIR
                  </div>
                  <div className="text-slate-200 text-[10px]">
                    1. Geli koodka ciwaanka si aad u hesho goobta:
                  </div>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-emerald-300 rounded p-1 text-xs font-mono uppercase"
                    placeholder="SDAS-MOG-XXXX"
                    autoFocus
                  />
                  <div className="flex justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDialStep('idle')}
                      className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px]"
                    >
                      Kansal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]"
                    >
                      Dir (Send)
                    </button>
                  </div>
                </form>
              )}

              {dialStep === 'result' && (
                <div className="space-y-3">
                  <div className="text-slate-100 whitespace-pre-line leading-relaxed text-[10px] bg-slate-900/80 p-2 rounded border border-slate-700">
                    {ussdOutput}
                  </div>
                  <button
                    onClick={() => setDialStep('idle')}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-1 rounded text-xs"
                  >
                    OK / Ka Bax
                  </button>
                </div>
              )}
            </div>

            {/* Simulated Phone Keypad */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300 pt-1">
              <span className="p-2 bg-slate-800 rounded">1</span>
              <span className="p-2 bg-slate-800 rounded">2</span>
              <span className="p-2 bg-slate-800 rounded">3</span>
              <span className="p-2 bg-slate-800 rounded">4</span>
              <span className="p-2 bg-slate-800 rounded">5</span>
              <span className="p-2 bg-slate-800 rounded">6</span>
              <span className="p-2 bg-slate-800 rounded">7</span>
              <span className="p-2 bg-slate-800 rounded">8</span>
              <span className="p-2 bg-slate-800 rounded">9</span>
              <span className="p-2 bg-slate-800 rounded">*</span>
              <span className="p-2 bg-slate-800 rounded">0</span>
              <span className="p-2 bg-slate-800 rounded">#</span>
            </div>
          </div>
        </div>

        {/* SMS 282 Gateway Simulator */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <MessageSquare className="w-4 h-4 text-blue-800 shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm">SMS Gateway (Lambarka 282)</h3>
            <span className="text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-mono ml-auto">
              Bilaash (Zero-Rated)
            </span>
          </div>

          <p className="text-xs text-slate-600">
            U soo dir koodhkaaga ciwaanka lambarka gaaban ee <strong>282</strong> si aad u hesho fariin qoraal ah oo xaqiijinaysa degmada, xaafadda, iyo iskudhafka rasmiga ah.
          </p>

          {/* SMS Chat Feed */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-64 overflow-y-auto space-y-2.5 text-xs">
            {smsResponses.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-lg ${
                    msg.sender === 'You'
                      ? 'bg-blue-900 text-white rounded-br-none'
                      : 'bg-white border border-slate-300 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  <span className="text-[10px] font-bold block mb-0.5 opacity-80">{msg.sender}</span>
                  <span>{msg.text}</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* SMS Input */}
          <form onSubmit={handleSendSms} className="flex gap-2">
            <input
              type="text"
              placeholder="Qor koodka ciwaanka (tusaale SDAS-MOG-7482)..."
              value={smsQuery}
              onChange={(e) => setSmsQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
            <button
              type="submit"
              className="bg-[#0c243e] hover:bg-blue-900 text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dir</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
