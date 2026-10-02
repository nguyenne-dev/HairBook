import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Đang bắt đầu seed dữ liệu mẫu...");

    // 1. Xóa dữ liệu cũ để tránh trùng lặp
    await prisma.user.deleteMany();
    console.log("🧹 Đã làm sạch bảng users.");

    // Mật khẩu chung cho tất cả tài khoản test: "123456"
    const passwordHash = await bcrypt.hash("123456", 10);

    // 2. Tạo 1 ADMIN
    await prisma.user.create({
        data: {
            username: "admin",
            email: "admin@bookinghair.com",
            passwordHash,
            phoneNumber: "0901000001",
            gender: "NAM",
            address: "Hà Nội",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            role: Role.ADMIN,
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
            },
        });
    }
    console.log("✅ Đã tạo 5 CUSTOMER (mật khẩu: 123456)");

    // 4. Tạo 10 HAIRDRESSERS (Thợ làm tóc chuyên nghiệp)
    const hairdressersData = [
        {
            username: "stylist_nam",
            email: "nam.stylist@bookinghair.com",
            phoneNumber: "0981000001",
            gender: "NAM",
            address: "Quận 1, TP. Hồ Chí Minh",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        },
        {
            username: "stylist_tuan",
            email: "tuan.stylist@bookinghair.com",
            phoneNumber: "0981000002",
            gender: "NAM",
            address: "Ba Đình, Hà Nội",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        },
        {
            username: "stylist_linh",
            email: "linh.stylist@bookinghair.com",
            phoneNumber: "0981000003",
            gender: "NỮ",
            address: "Hoàn Kiếm, Hà Nội",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        },
        {
            username: "stylist_hoang",
            email: "hoang.stylist@bookinghair.com",
            phoneNumber: "0981000004",
            gender: "NAM",
            address: "Cầu Giấy, Hà Nội",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        },
        {
            username: "stylist_mai",
            email: "mai.stylist@bookinghair.com",
            phoneNumber: "0981000005",
            gender: "NỮ",
            address: "Quận 3, TP. Hồ Chí Minh",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        },
        {
            username: "stylist_phong",
            email: "phong.stylist@bookinghair.com",
            phoneNumber: "0981000006",
            gender: "NAM",
            address: "Hải Châu, Đà Nẵng",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
        },
        {
            username: "stylist_an",
            email: "an.stylist@bookinghair.com",
            phoneNumber: "0981000007",
            gender: "NAM",
            address: "Tây Hồ, Hà Nội",
            avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
        },
        {
            username: "stylist_huong",
            email: "huong.stylist@bookinghair.com",
            phoneNumber: "0981000008",
            gender: "NỮ",
            address: "Bình Thạnh, TP. Hồ Chí Minh",
            avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
        },
        {
            username: "stylist_dung",
            email: "dung.stylist@bookinghair.com",
            phoneNumber: "0981000009",
            gender: "NAM",
            address: "Đống Đa, Hà Nội",
            avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
        },
        {
            username: "stylist_thao",
            email: "thao.stylist@bookinghair.com",
            phoneNumber: "0981000010",
            gender: "NỮ",
            address: "Thanh Khê, Đà Nẵng",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        },
    ];

    for (const h of hairdressersData) {
        await prisma.user.create({
            data: {
                ...h,
                passwordHash,
                role: Role.HAIRDRESSER,
            },
        });
    }
    console.log("✅ Đã tạo 10 HAIRDRESSER (mật khẩu: 123456)");

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
