import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Rimuovo async poiché non è necessario
  console.log('=== INIZIO TEST UPLOAD ===');
  console.log('Metodo richiesta:', req.method);
  console.log('Process CWD:', process.cwd());

  try {
    // Test 1: Verifica esistenza directory
    const uploadDir = path.join(process.cwd(), 'User_Uploads');
    console.log('Test 1 - Directory:', uploadDir);
    console.log('Directory esiste:', fs.existsSync(uploadDir));

    // Test 2: Creazione directory
    if (!fs.existsSync(uploadDir)) {
      console.log('Test 2 - Creazione directory');
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Directory creata:', fs.existsSync(uploadDir));
    }

    // Test 3: Scrittura file
    try {
      console.log('Test 3 - Scrittura file');
      const testFile = path.join(uploadDir, 'test.txt');
      fs.writeFileSync(testFile, 'Test ' + Date.now());
      console.log('File scritto con successo');
    } catch (writeError) {
      console.error('Errore scrittura file:', writeError);
      throw writeError;
    }

    // Test 4: Lettura file
    try {
      console.log('Test 4 - Lettura file');
      const testFile = path.join(uploadDir, 'test.txt');
      const content = fs.readFileSync(testFile, 'utf8');
      console.log('Contenuto file:', content);
    } catch (readError) {
      console.error('Errore lettura file:', readError);
      throw readError;
    }

    console.log('=== TEST COMPLETATO CON SUCCESSO ===');

    res.status(200).json({
      success: true,
      message: 'Test completato con successo',
      directory: uploadDir,
      tests: {
        directoryExists: fs.existsSync(uploadDir),
        fileWritten: fs.existsSync(path.join(uploadDir, 'test.txt'))
      }
    });
  } catch (error) {
    console.error('=== ERRORE NEL TEST ===');
    console.error('Tipo errore:', error.name);
    console.error('Messaggio:', error.message);
    console.error('Stack:', error.stack);

    res.status(500).json({
      success: false,
      error: {
        type: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
} 