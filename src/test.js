
const jsonData = {
    "Categories": [
        {
            "categorie": "Vechter technieken",
            "Skills": ["Skill1", "Skill2", "Skill3"]
        },
        {
            "categorie": "Vechter technieken",
            "Skills": ["Skill4", "Skill5"]
        }
    ]
};

// Initialize an empty array to store the skills
const allSkills = [];

// Iterate through the Categories array and collect the Skills
jsonData.Categories.forEach(category => {
    allSkills.push(...category.Skills);
});

console.log(allSkills);