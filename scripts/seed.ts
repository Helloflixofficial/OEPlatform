const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
  const categories = [
    { name: "Music" },
    { name: "Editing" },
    { name: "Fitness" },
    { name: "Painting" },
    { name: "Photography" },
    { name: "Engineering" },
    { name: "Computer_Science" },
    { name: "Website_Development" },
  ];
  console.log("working gooood");
  for (const category of categories) {
    try {
      await database.category.create({
        data: category,
      });
      console.log(`Category '${category.name}' created successfully`);
    } catch (error) {
      if (
        error.code === "P2002" &&
        error.meta?.modelName === "Category" &&
        error.meta?.target?.includes("name")
      ) {
        console.error(
          `Error: Category with name '${category.name}' already exists.`
        );
      } else {
        console.error(error);
      }
    }
  }
  await database.$disconnect();
}
main();
