// Seed initial admin, teachers, subjects, classes, and lessons
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    // Admin user
    const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const hash = await bcrypt.hash(password, 10);

    await prisma.user?.upsert?.({
        where: { email },
        update: { passwordHash: hash, name: "Admin", role: 8 },
        create: { email, passwordHash: hash, name: "Admin", role: 8 },
    });

    // Teachers
    const t1 = await prisma.teacher?.upsert?.({
        where: { email: "teacher1@example.com" },
        update: { name: "Иван Иванов" },
        create: { email: "teacher1@example.com", name: "Иван Иванов" },
    });
    const t2 = await prisma.teacher?.upsert?.({
        where: { email: "teacher2@example.com" },
        update: { name: "Мария Петрова" },
        create: { email: "teacher2@example.com", name: "Мария Петрова" },
    });

    // Subjects
    const subjects = [
        { name: "Математика", code: "MATH" },
        { name: "Русский язык", code: "RUS" },
        { name: "Информатика", code: "CS" },
        { name: "Литература", code: "LIT" },
        { name: "Физика", code: "PHYS" },
    ];
    for (const s of subjects) {
        await prisma.subject?.upsert?.({ where: { name: s.name }, update: {}, create: s });
    }
    const sub = Object.fromEntries((await prisma.subject?.findMany?.())?.map((s) => [s.name, s]) || []);

    // Classes
    const c1 = await prisma.class?.upsert?.({
        where: { name: "5А" },
        update: { headTeacherId: t1?.id },
        create: { name: "5А", headTeacherId: t1?.id },
    });
    const c2 = await prisma.class?.upsert?.({
        where: { name: "6Б" },
        update: { headTeacherId: t2?.id },
        create: { name: "6Б", headTeacherId: t2?.id },
    });

    // Lessons
    if (sub["Математика"] && c1) {
        await prisma.lesson?.createMany?.({
            data: [
                { classId: c1.id, teacherId: t1?.id || null, day: "MON", lessonNumber: 1, subject: "Математика", subjectId: sub["Математика"].id, room: "101" },
                { classId: c1.id, teacherId: t2?.id || null, day: "MON", lessonNumber: 2, subject: "Русский язык", subjectId: sub["Русский язык"].id, room: "202" },
                { classId: c1.id, teacherId: t1?.id || null, day: "TUE", lessonNumber: 1, subject: "Информатика", subjectId: sub["Информатика"].id, room: "305" },
            ],
            skipDuplicates: true,
        });
    }
    if (sub["Литература"] && c2) {
        await prisma.lesson?.createMany?.({
            data: [
                { classId: c2.id, teacherId: t2?.id || null, day: "MON", lessonNumber: 1, subject: "Литература", subjectId: sub["Литература"].id, room: "204" },
                { classId: c2.id, teacherId: t1?.id || null, day: "TUE", lessonNumber: 2, subject: "Физика", subjectId: sub["Физика"].id, room: "402" },
            ],
            skipDuplicates: true,
        });
    }

    // Events
    const today = new Date();
    const addDays = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
    await prisma.event?.createMany?.({
        data: [
            { title: "Родительское собрание", description: "5А, актовый зал", date: addDays(1) },
            { title: "Олимпиада по математике", description: "каб. 101", date: addDays(2) },
            { title: "Спортивные соревнования", description: "спортзал", date: addDays(4) },
        ],
        skipDuplicates: true,
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log("Seed completed");
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });


