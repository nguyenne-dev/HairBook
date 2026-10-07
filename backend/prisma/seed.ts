import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Đang bắt đầu seed dữ liệu mẫu...");

    // 1. Xóa dữ liệu cũ theo thứ tự quan hệ
    await prisma.workingSchedule.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
    console.log("🧹 Đã làm sạch dữ liệu cũ.");

    // Mật khẩu chung cho tất cả tài khoản test: "123456"
    const passwordHash = await bcrypt.hash("123456", 10);

    // 2. Tạo 1 ADMIN
    const admin = await prisma.user.create({
        data: {
            username: "admin",
            email: "admin@bookinghair.com",
            passwordHash,
            phoneNumber: "0901000001",
            gender: "NAM",
            address: "Hà Nội",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            role: Role.ADMIN,
            isActive: true,
        },
    });
    console.log("✅ Đã tạo 1 ADMIN: admin (123456)");

    // 3. Tạo 5 CUSTOMERS (Khách hàng)
    const customersData = [
        { username: "khach_minh", email: "minh@gmail.com", phoneNumber: "0911000001", gender: "NAM", address: "Hà Nội" },
        { username: "khach_lan", email: "lan@gmail.com", phoneNumber: "0911000002", gender: "NỮ", address: "Hải Phòng" },
        { username: "khach_duy", email: "duy@gmail.com", phoneNumber: "0911000003", gender: "NAM", address: "Đà Nẵng" },
        { username: "khach_ngoc", email: "ngoc@gmail.com", phoneNumber: "0911000004", gender: "NỮ", address: "TP. Hồ Chí Minh" },
        { username: "khach_hung", email: "hung@gmail.com", phoneNumber: "0911000005", gender: "NAM", address: "Cần Thơ" },
    ];

    for (const c of customersData) {
        await prisma.user.create({
            data: {
                ...c,
                passwordHash,
                role: Role.CUSTOMER,
                isActive: true,
            },
        });
    }
    console.log("✅ Đã tạo 5 CUSTOMER (mật khẩu: 123456)");

    // 4. Tạo 10 HAIRDRESSERS (Thợ làm tóc chuyên nghiệp) kèm lịch làm việc
    const hairdressersData = [
        { username: "stylist_nam", email: "nam.stylist@bookinghair.com", phoneNumber: "0981000001", gender: "NAM", address: "Quận 1, TP. Hồ Chí Minh" },
        { username: "stylist_tuan", email: "tuan.stylist@bookinghair.com", phoneNumber: "0981000002", gender: "NAM", address: "Ba Đình, Hà Nội" },
        { username: "stylist_linh", email: "linh.stylist@bookinghair.com", phoneNumber: "0981000003", gender: "NỮ", address: "Hoàn Kiếm, Hà Nội" },
        { username: "stylist_hoang", email: "hoang.stylist@bookinghair.com", phoneNumber: "0981000004", gender: "NAM", address: "Cầu Giấy, Hà Nội" },
        { username: "stylist_mai", email: "mai.stylist@bookinghair.com", phoneNumber: "0981000005", gender: "NỮ", address: "Quận 3, TP. Hồ Chí Minh" },
        { username: "stylist_phong", email: "phong.stylist@bookinghair.com", phoneNumber: "0981000006", gender: "NAM", address: "Hải Châu, Đà Nẵng" },
        { username: "stylist_an", email: "an.stylist@bookinghair.com", phoneNumber: "0981000007", gender: "NAM", address: "Tây Hồ, Hà Nội" },
        { username: "stylist_huong", email: "huong.stylist@bookinghair.com", phoneNumber: "0981000008", gender: "NỮ", address: "Bình Thạnh, TP. Hồ Chí Minh" },
        { username: "stylist_dung", email: "dung.stylist@bookinghair.com", phoneNumber: "0981000009", gender: "NAM", address: "Đống Đa, Hà Nội" },
        { username: "stylist_thao", email: "thao.stylist@bookinghair.com", phoneNumber: "0981000010", gender: "NỮ", address: "Thanh Khê, Đà Nẵng" },
    ];

    for (const h of hairdressersData) {
        const hairdresser = await prisma.user.create({
            data: {
                ...h,
                passwordHash,
                role: Role.HAIRDRESSER,
                isActive: true,
            },
        });

        // Tạo sẵn lịch làm việc từ Thứ 2 đến Thứ 7 (08:00 - 20:00), Chủ nhật nghỉ
        const schedules = [];
        for (let day = 0; day <= 6; day++) {
            schedules.push({
                hairdresserId: hairdresser.id,
                dayOfWeek: day,
                startTime: "08:00",
                endTime: "20:00",
                breakStartTime: "12:00",
                breakEndTime: "14:00",
                isDayOff: day === 0, // 0 = Chủ nhật nghỉ
            });
        }
        await prisma.workingSchedule.createMany({ data: schedules });
    }
    console.log("✅ Đã tạo 10 HAIRDRESSER kèm lịch làm việc (T2 - T7 từ 08:00 - 20:00, nghỉ trưa 12:00 - 14:00, CN nghỉ)");

    // 5. Tạo các DỊCH VỤ TÓC mẫu
    const servicesData = [
        { name: "Cắt tóc tạo kiểu Undercut", description: "Cắt tạo kiểu và sấy form chuẩn", price: 100000, duration: 30 },
        { name: "Cắt tóc nữ Layer", description: "Cắt tỉa layer thời thượng chuẩn Hàn", price: 150000, duration: 45 },
        { name: "Uốn xoăn sóng lơi", description: "Uốn xoăn tự nhiên giữ nếp 6 tháng", price: 350000, duration: 90 },
        { name: "Nhuộm tóc thời trang", description: "Nhuộm màu tôn da kèm phục hồi nano", price: 400000, duration: 90 },
        { name: "Gội đầu dưỡng sinh thảo dược", description: "Gội đầu kèm massage cổ vai gáy", price: 80000, duration: 45 },
        { name: "Phục hồi tóc Collagen", description: "Hấp dầu phục hồi tóc hư tổn chuyên sâu", price: 250000, duration: 60 },
    ];

    for (const s of servicesData) {
        await prisma.service.create({
            data: {
                ...s,
                createdById: admin.id,
            },
        });
    }
    console.log("✅ Đã tạo 6 DỊCH VỤ TÓC mẫu.");

    console.log("🎉 Seed dữ liệu thành công hoàn tất!");
}

main()
    .catch((e) => {
        console.error("❌ Lỗi khi seed dữ liệu:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
