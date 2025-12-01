const fs = require('fs');
const path = require('path');

const modules = [
  'researchers',
  'roles',
  'institutions',
  'research-projects',
  'subgroups',
  'field-researches',
  'questions',
  'questionnaires',
  'question-sequences',
  'surveys'
];

modules.forEach(moduleName => {
  const filePath = path.join(__dirname, 'src', moduleName, `${moduleName}.module.ts`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover import do TypeOrmModule
    content = content.replace(/import\s+{\s*TypeOrmModule\s*}\s+from\s+['"]@nestjs\/typeorm['"];?\n?/g, '');
    
    // Remover import das entities
    content = content.replace(/import\s+{\s*\w+(\s*,\s*\w+)*\s*}\s+from\s+['"]\.[\/\\]entities[\/\\][\w\-]+\.entity['"];?\n?/g, '');
    
    // Remover TypeOrmModule.forFeature dos imports
    content = content.replace(/TypeOrmModule\.forFeature\(\[[\w\s,]+\]\),?\s*/g, '');
    
    // Limpar imports vazios no @Module
    content = content.replace(/imports:\s*\[\s*\],?\s*/g, '');
    
    //Limpar vírgulas duplas
    content = content.replace(/,\s*,/g, ',');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Atualizado: ${moduleName}.module.ts`);
  }
});

console.log('\n✅ Todos os módulos foram atualizados!');
