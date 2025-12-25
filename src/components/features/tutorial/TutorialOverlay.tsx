import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { Skull, Siren, TrendingUp, HandMetal, ArrowRight, Check } from 'lucide-react';

export const TutorialOverlay = () => {
    const { tutorialStep, advanceTutorial, skipTutorial } = useGameStore();

    if (tutorialStep >= 5) return null;

    const steps = [
        {
            title: "ยินดีต้อนรับสู่โลกใต้ดิน",
            description: "คุณคือโจรหน้าใหม่ที่มีฝันใหญ่ เป้าหมายคือการเป็นเจ้าพ่อมาเฟีย",
            icon: HandMetal,
            color: "text-white",
            action: "เริ่มเลย"
        },
        {
            title: "ก่ออาชญากรรม",
            description: "เปิดแอป 'Jobs' เพื่อหาเงินสกปรก เริ่มจากงานวิ่งราวเล็กๆ แต่ระวังค่าพลังงานด้วยครับ",
            icon: Skull,
            color: "text-risk",
            action: "เข้าใจแล้ว"
        },
        {
            title: "ระวังค่าหัว (Heat)",
            description: "ยิ่งทำชั่วยิ่ง Heat ขึ้น ถ้าแตะ 100% คือโดนจับ! ต้องรอเวลาหรือจ่ายส่วยตำรวจ",
            icon: Siren,
            color: "text-blue-400",
            action: "รับทราบ"
        },
        {
            title: "รายได้มืด (Passive)",
            description: "เข้าแอป 'Business' เพื่อฟอกเงินซื้อธุรกิจ มันจะทำเงินให้คุณเรื่อยๆ แม้ตอนปิดเกม",
            icon: TrendingUp,
            color: "text-money",
            action: "ทำเงินกัน"
        },
        {
            title: "โชคดีครับนาย",
            description: "หาของดีๆ อัปเกรดเทคโนโลยี แล้วครองเมืองซะ อย่าให้โดนจับได้ล่ะ",
            icon: Check,
            color: "text-gold",
            action: "ลุย"
        }
    ];

    const currentStep = steps[tutorialStep];
    const Icon = currentStep.icon;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-surface border border-white/10 p-8 rounded-3xl max-w-sm w-full relative overflow-hidden shadow-2xl">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-${currentStep.color.replace('text-', '')}/20 to-transparent blur-3xl -z-10`} />

                <div className="flex flex-col items-center text-center gap-6">
                    <div className={`w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center ${currentStep.color} shadow-lg ring-1 ring-white/10`}>
                        <Icon size={40} />
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            สอนเล่น {tutorialStep + 1}/{steps.length}
                        </div>
                        <h2 className="text-2xl font-black text-white">{currentStep.title}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {currentStep.description}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={advanceTutorial}
                            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {currentStep.action} <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={skipTutorial}
                            className="text-xs text-gray-600 hover:text-gray-400 decoration-slice"
                        >
                            ข้ามสอนเล่น
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
