export interface SocialMessage {
    id: string;
    sender: string;
    message: string;
    type: 'news' | 'system' | 'dm';
    timestamp: number;
    likes?: number;
}

export const SOCIAL_FLUFF = [
    { sender: 'ข่าวสดอาชญากรรม', message: 'ตำรวจประกาศกวาดล้างพื้นที่สีเทา สัปดาห์นี้ระวังตัวกันด้วย!' },
    { sender: 'Noname', message: 'ใครมีของปล่อยบ้าง ทักแชทส่วนตัวมา' },
    { sender: 'Civilian', message: 'เมื่อคืนเสียงปืนดังแถวสลัม น่ากลัวมาก...' },
    { sender: 'DarkWeb', message: 'Bitcoin ร่วงอีกแล้ว ร้อนเงินว่ะ' },
    { sender: 'Mafia Boss', message: 'เด็กใหม่สมัยนี้ห้าวเป้งจังวะ' },
    { sender: 'Police Radio', message: '[แจ้งเหตุ] พบกิจกรรมต้องสงสัยเขต 4 เจ้าหน้าที่กำลังไปตรวจสอบ' },
];
