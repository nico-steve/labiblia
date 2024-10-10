const books = [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel",
  "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías", "Ester", "Job", "Salmos", "Proverbios",
  "Eclesiastés", "Cantares", "Isaías", "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel", "Amós",
  "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías",
  "Mateo", "Marcos", "Lucas", "Juan", "Hechos", "Romanos", "1 Corintios", "2 Corintios", "Gálatas", "Efesios",
  "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses", "1 Timoteo", "2 Timoteo", "Tito", "Filemón",
  "Hebreos", "Santiago", "1 Pedro", "2 Pedro", "1 Juan", "2 Juan", "3 Juan", "Judas", "Apocalipsis"
];

const bookSelect = document.getElementById('book');
const chapterSelect = document.getElementById('chapter');
const verseSelect = document.getElementById('verse');
const analyzeButton = document.getElementById('analyze');
const resultDiv = document.getElementById('result');

function populateBooks() {
  bookSelect.innerHTML = '<option value="">Seleccione un libro</option>';
  books.forEach(book => {
    const option = document.createElement('option');
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
  });
}

function getChapters(book) {
  const chapterCounts = {
    "Génesis": 50, "Éxodo": 40, "Levítico": 27, "Números": 36, "Deuteronomio": 34,
    "Josué": 24, "Jueces": 21, "Rut": 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Reyes": 22, "2 Reyes": 25, "1 Crónicas": 29, "2 Crónicas": 36, "Esdras": 10,
    "Nehemías": 13, "Ester": 10, "Job": 42, "Salmos": 150, "Proverbios": 31,
    "Eclesiastés": 12, "Cantares": 8, "Isaías": 66, "Jeremías": 52, "Lamentaciones": 5,
    "Ezequiel": 48, "Daniel": 12, "Oseas": 14, "Joel": 3, "Amós": 9,
    "Abdías": 1, "Jonás": 4, "Miqueas": 7, "Nahúm": 3, "Habacuc": 3,
    "Sofonías": 3, "Hageo": 2, "Zacarías": 14, "Malaquías": 4,
    "Mateo": 28, "Marcos": 16, "Lucas": 24, "Juan": 21, "Hechos": 28,
    "Romanos": 16, "1 Corintios": 16, "2 Corintios": 13, "Gálatas": 6, "Efesios": 6,
    "Filipenses": 4, "Colosenses": 4, "1 Tesalonicenses": 5, "2 Tesalonicenses": 3,
    "1 Timoteo": 6, "2 Timoteo": 4, "Tito": 3, "Filemón": 1, "Hebreos": 13,
    "Santiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 Juan": 5, "2 Juan": 1, "3 Juan": 1,
    "Judas": 1, "Apocalipsis": 22
  };
  
  return Array.from({length: chapterCounts[book] || 150}, (_, i) => i + 1);
}

function getVerses(book, chapter) {
  return Array.from({length: 176}, (_, i) => i + 1);
}

function populateChapters() {
  const book = bookSelect.value;
  chapterSelect.innerHTML = '<option value="">Capítulo</option>';
  const chapters = getChapters(book);
  chapters.forEach(chapter => {
    const option = document.createElement('option');
    option.value = chapter;
    option.textContent = chapter;
    chapterSelect.appendChild(option);
  });
}

function populateVerses() {
  const book = bookSelect.value;
  const chapter = chapterSelect.value;
  verseSelect.innerHTML = '<option value="">Versículo</option>';
  const verses = getVerses(book, chapter);
  verses.forEach(verse => {
    const option = document.createElement('option');
    option.value = verse;
    option.textContent = verse;
    verseSelect.appendChild(option);
  });
}

async function getVerseText(book, chapter, verse) {
  try {
    const response = await fetch(`https://labs.bible.org/api/?passage=${book}${chapter}:${verse}&type=json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data[0] && data[0].text) {
      return data[0].text;
    } else {
      throw new Error('No se encontró el texto del versículo en la respuesta de la API');
    }
  } catch (error) {
    console.error('Error fetching verse text:', error);
    throw new Error(`No se pudo obtener el texto del versículo. Error: ${error.message}`);
  }
}

async function getAnalysis(book, chapter, verse, verseText) {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch('/api/intelligence/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book,
        chapter,
        verse,
        verseText,
        query: `Proporciona un análisis detallado y extenso del versículo ${book} ${chapter}:${verse}. Incluye contexto histórico, interpretación teológica, aplicación práctica y cualquier otra información relevante. No escatimes en detalles y explaya la respuesta lo que sea necesario para una comprensión profunda.`
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    return {
      analysis: aiResponse.analysis || 'No se pudo obtener el análisis.',
      references: aiResponse.references || [],
      explanations: aiResponse.explanations || [],
      webInfo: aiResponse.webInfo || 'No hay información adicional disponible.'
    };
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw new Error('No se pudo obtener el análisis. Por favor, verifica tu conexión a internet.');
  }
}

async function analyzeVerse() {
  try {
    const book = bookSelect.value;
    const chapter = chapterSelect.value;
    const verse = verseSelect.value;

    if (!book || !chapter || !verse) {
      throw new Error('Por favor, seleccione un libro, capítulo y versículo.');
    }

    resultDiv.innerHTML = '<p class="loading">Dame un momento, lo estoy consultando con Dios...</p>';

    const verseText = await getVerseText(book, chapter, verse);
    displayResult(book, chapter, verse, verseText);
    const analysis = await getAnalysis(book, chapter, verse, verseText);
    displayAnalysis(analysis);
  } catch (error) {
    resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    console.error('Error en analyzeVerse:', error);
  }
}

function displayResult(book, chapter, verse, verseText) {
  resultDiv.innerHTML = `
    <p class="verse">${book} ${chapter}:${verse}</p>
    <p class="verse-text">${verseText}</p>
  `;
}

function  displayAnalysis(analysis) {
  resultDiv.innerHTML += `
    <div class="analysis">
      <h3>Análisis:</h3>
      ${analysis.analysis.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
    </div>
    ${analysis.explanations.length > 0 ? `
    <div class="explanations">
      <h3>Términos:</h3>
      ${analysis.explanations.map(exp => `
        <div class="explanation">
          <strong>${exp.term}:</strong> ${exp.explanation}
        </div>
      `).join('')}
    </div>
    ` : ''}
    <div class="references">
      <h3>Referencias:</h3>
      <ul>
        ${analysis.references.map(ref => `<li><span class="reference-link" onclick="analyzeVerse('${ref}')">${ref}</span></li>`).join('')}
      </ul>
    </div>
    <div class="web-info">
      <h3>Información Adicional:</h3>
      ${Array.isArray(analysis.webInfo) 
        ? analysis.webInfo.map(info => `<p>${info}</p>`).join('')
        : `<p>${analysis.webInfo}</p>`
      }
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  populateBooks();
  bookSelect.addEventListener('change', () => {
    populateChapters();
    verseSelect.innerHTML = '<option value="">Versículo</option>';
  });
  chapterSelect.addEventListener('change', populateVerses);
  analyzeButton.addEventListener('click', analyzeVerse);
});

particlesJS('particles-js', {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 } },
    opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
    size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
    line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
    move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } }
  },
  interactivity: {
    detect_on: "canvas",
    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
    modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
  },
  retina_detect: true
});