document.getElementById('file-input').addEventListener('change', handleFile);

let yearData = {};

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0]; // Oletetaan, että data on ensimmäisellä sivulla
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        processExcelData(jsonData);
    };
    
    reader.readAsArrayBuffer(file);
}

function processExcelData(data) {
    yearData = {}; // Nollaa aiempi data

    data.forEach(row => {
        const year = row['Vuosi'];
        if (!yearData[year]) {
            yearData[year] = [];
        }
        yearData[year].push(row);
    });

    populateYearSelector();
    renderTable(2024); // Oletuksena näytetään vuosi 2024
}

function populateYearSelector() {
    const yearSelector = document.getElementById('year-selector');
    yearSelector.innerHTML = ''; // Tyhjennä aiempi sisältö

    Object.keys(yearData)
        .sort((a, b) => b - a) // Lajittele vuodet laskevassa järjestyksessä
        .forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        });

    yearSelector.addEventListener('change', () => {
        const selectedYear = yearSelector.value;
        renderTable(selectedYear);
    });
}

function renderTable(data, year) {
    tableBody.innerHTML = ''; // Tyhjennetään vanha sisältö
    const filteredData = data.filter(row => row.Kausi == year);

    filteredData.forEach(row => {
        const tr = document.createElement('tr');

        // Korosta HPS-joukkue
        if (row.Joukkue && row.Joukkue.trim() === 'HPS') {
            tr.classList.add('highlight-hps');
        }

        // Täytetään sarakkeet
        ['sij.', 'Joukkue', 'Ottelut', 'V', 'T', 'H', 'TM', 'PM', 'Pisteet', 'Unnamed: 11'].forEach((column, index) => {
            const td = document.createElement('td');
            let value = row[column] || 0; // Korvataan tyhjät solut 0:lla

            // Poista nollat Kommentti-sarakkeesta (indeksi 9)
            if (index === 9 && (value === 0 || value === '0')) {
                value = ''; // Korvataan nolla tyhjällä arvolla
            }

            // Lisää logo ja nimi Joukkue-sarakkeeseen
            if (index === 1) {
                const logo = document.createElement('span');
                if (row.Joukkue.trim() === 'HPS') {
                    logo.innerHTML = `<img src="HPS-logo.jpg" alt="HPS" class="team-logo hps">`;
                } else {
                    logo.className = 'team-logo';
                }
                td.appendChild(logo);
                td.innerHTML += value;
            } else {
                td.textContent = value; // Asetetaan muut arvot normaalisti
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}
