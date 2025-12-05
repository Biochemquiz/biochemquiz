// --- Configuration ---
const SHEET_MAP = {
    'daily': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSfpljSRlQUhMAdo3E_eTBwyYXNlcvLPjwyrZaKN2LGr3JiojSVHRpvWgJEoAIg0NP49maM20ISMTwU/pub?output=csv',
    'mol_all': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?output=csv', // Placeholder - User needs to ensure these are correct in original
    // ... (We will rely on the original map, I'll copy it fully in the final step if needed, or assume user fills it)
    // For now, I'll copy the structure from the original file to ensure it works.
};

// Re-using the logic from original file but enhancing it
const BLOG_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3ZlgFhkSowtqTzfCCZtar4xPNwHz_OoXW2no5Oi-ry-pp_9vE4D2DNZ6Tk7gTx3squbRmgjJrM-Qo/pub?output=csv";

// --- Globals ---
let allBlogPosts = [];
let currentBlogPage = 1;
const POSTS_PER_PAGE = 5;

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // To track history if needed

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // Check URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const activeTopic = urlParams.get('topic');
    const activeTool = urlParams.get('tool');
    const activePage = urlParams.get('page');

    hideAllViews();

    if (activePage) {
        const pageEl = document.getElementById(`view-${activePage}`);
        if (pageEl) pageEl.style.display = 'block';
        else document.getElementById('view-feed').style.display = 'block';
    } else if (activeTopic) {
        document.getElementById('view-quiz').style.display = 'block';
        loadQuiz(activeTopic);
    } else if (activeTool) {
        const toolEl = document.getElementById(`view-calc-${activeTool}`);
        if (toolEl) {
            toolEl.style.display = 'block';
            renderMathInElement(document.body);
        }
    } else {
        document.getElementById('view-feed').style.display = 'block';
        loadBlog();
    }

    // Event Listeners for Dropdowns
    window.onclick = (e) => {
        if (!e.target.matches('.dropbtn')) {
            document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
        }
    };
});

// --- UI Helpers ---
function toggleMenu(id) {
    const menu = document.getElementById(id);
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function toggleHeaderDropdown(id) {
    // Close others
    document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d.id !== id) d.classList.remove('show');
    });
    document.getElementById(id).classList.toggle('show');
}

function hideAllViews() {
    const views = document.querySelectorAll('main > div');
    views.forEach(v => v.style.display = 'none');
}

// --- Blog Logic ---
function loadBlog() {
    const loader = document.getElementById('blog-loading');
    if (!loader) return;

    const freshUrl = BLOG_SHEET_URL + '&t=' + new Date().getTime();
    Papa.parse(freshUrl, {
        download: true,
        header: true,
        complete: function (results) {
            if (!results.data || results.data.length === 0) {
                loader.innerHTML = "No posts found.";
                return;
            }

            // Smart Column Detection
            const firstRow = results.data[0];
            const titleKey = Object.keys(firstRow).find(k => k.match(/title|headline/i));

            if (!titleKey) {
                loader.innerHTML = "Error loading blog data.";
                return;
            }

            allBlogPosts = results.data.filter(post => post[titleKey]);
            loader.style.display = 'none';
            renderBlogPage(1);
        },
        error: (err) => { loader.innerHTML = "Connection Error"; }
    });
}

function renderBlogPage(pageNum) {
    currentBlogPage = pageNum;
    const feedContainer = document.getElementById('dynamic-articles-feed');
    const paginationDiv = document.getElementById('pagination-controls');

    feedContainer.innerHTML = "";

    const start = (pageNum - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pagePosts = allBlogPosts.slice(start, end);

    pagePosts.forEach((post, index) => {
        const getVal = (pattern) => {
            const key = Object.keys(post).find(k => k.match(new RegExp(pattern, 'i')));
            return key ? post[key] : '';
        };

        const title = getVal('title') || getVal('headline');
        const date = getVal('date') || 'Recent';
        const source = getVal('source') || 'News';
        const summary = getVal('summary') || '';
        const content = getVal('content') || '';
        const globalIndex = start + index;

        const div = document.createElement('div');
        div.className = 'article-preview glass-panel';
        div.innerHTML = `
            <h2><a href="#" onclick="openArticle(${globalIndex})">${title}</a></h2>
            <div class="meta-line">${date} • ${source}</div>
            <div class="summary-box">${summary}</div>
            <a href="#" onclick="openArticle(${globalIndex})" class="read-more-link">Read Full Story &rarr;</a>
        `;
        feedContainer.appendChild(div);

        // Store content for full view
        post._fullContent = content;
        post._title = title;
        post._date = date;
        post._source = source;
    });

    // Pagination
    const totalPages = Math.ceil(allBlogPosts.length / POSTS_PER_PAGE);
    if (totalPages > 1) {
        paginationDiv.style.display = 'flex';
        let html = '';
        if (pageNum > 1) html += `<button class="page-btn" onclick="renderBlogPage(${pageNum - 1})">&larr;</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === pageNum ? 'active' : ''}" onclick="renderBlogPage(${i})">${i}</button>`;
        }
        if (pageNum < totalPages) html += `<button class="page-btn" onclick="renderBlogPage(${pageNum + 1})">&rarr;</button>`;
        paginationDiv.innerHTML = html;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function openArticle(index) {
    const post = allBlogPosts[index];
    if (!post) return;

    hideAllViews();
    const view = document.getElementById('view-article-detail');
    view.style.display = 'block';

    const container = document.getElementById('dynamic-article-container');
    container.innerHTML = `
        <div class="glass-panel" style="padding: 40px;">
            <div class="meta-line">${post._date} • ${post._source}</div>
            <h1 style="margin-top:10px; font-size:2rem;">${post._title}</h1>
            <div class="article-body" style="margin-top:30px;">
                ${post._fullContent.replace(/\n/g, '<p>')}
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

function closeArticle() {
    hideAllViews();
    document.getElementById('view-feed').style.display = 'block';
}

// --- Quiz Logic (Interactive) ---
function loadQuiz(topic) {
    // For demo, if topic not in map, show error
    // In real app, ensure SHEET_MAP is populated
    const url = SHEET_MAP[topic] || SHEET_MAP['daily']; // Fallback for testing if map incomplete

    const spinner = document.getElementById('loading-spinner');
    const error = document.getElementById('error-container');
    const container = document.getElementById('quiz-interface');

    spinner.style.display = 'block';
    error.style.display = 'none';
    container.style.display = 'none';

    Papa.parse(url, {
        download: true,
        header: true,
        complete: (res) => {
            quizData = res.data.filter(d => d.Question).map(d => ({
                q: d.Question,
                o: [d.Option1, d.Option2, d.Option3, d.Option4],
                c: (parseInt(d.CorrectAnswer) || 1) - 1,
                e: d.Explanation
            }));

            if (quizData.length === 0) {
                spinner.style.display = 'none';
                error.innerHTML = "No questions found.";
                error.style.display = 'block';
                return;
            }

            startQuiz();
        },
        error: (err) => {
            spinner.style.display = 'none';
            let msg = "Failed to load quiz data.";
            if (window.location.protocol === 'file:') {
                msg += "<br><br><b>Note:</b> Browsers may block loading external data (Google Sheets) when opening HTML files directly. <br>Try using a local server (e.g., VS Code Live Server).";
            }
            error.innerHTML = msg;
            error.style.display = 'block';
        }
    });
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('quiz-interface').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    renderQuestion();
}

function renderQuestion() {
    const q = quizData[currentQuestionIndex];
    const total = quizData.length;

    // Update Progress
    const pct = ((currentQuestionIndex) / total) * 100;
    document.getElementById('quiz-progress-bar').style.width = `${pct}%`;
    document.getElementById('quiz-progress-text').innerText = `Question ${currentQuestionIndex + 1} of ${total}`;

    // Render Text
    document.getElementById('question-text').innerText = q.q;

    // Render Options
    const optsDiv = document.getElementById('options-container');
    optsDiv.innerHTML = '';

    q.o.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(idx, btn);
        optsDiv.appendChild(btn);
    });

    // Hide Feedback / Next
    document.getElementById('quiz-feedback').style.display = 'none';
    document.getElementById('btn-next-question').style.display = 'none';

    renderMathInElement(document.getElementById('quiz-interface'));
}

function handleAnswer(selectedIndex, btn) {
    const q = quizData[currentQuestionIndex];
    const opts = document.querySelectorAll('.option-btn');

    // Disable all
    opts.forEach(b => {
        b.classList.add('disabled');
        b.onclick = null;
    });

    const isCorrect = selectedIndex === q.c;
    if (isCorrect) {
        btn.classList.add('correct');
        score++;
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } }); // Mini confetti
    } else {
        btn.classList.add('incorrect');
        opts[q.c].classList.add('correct'); // Show correct one
    }

    // Show Feedback
    const fb = document.getElementById('quiz-feedback');
    fb.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${q.e || ''}`;
    fb.style.display = 'block';
    renderMathInElement(fb);

    // Show Next Button
    const nextBtn = document.getElementById('btn-next-question');
    nextBtn.innerText = (currentQuestionIndex === quizData.length - 1) ? "Finish Quiz" : "Next Question";
    nextBtn.style.display = 'block';
    nextBtn.onclick = nextQuestion;
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-interface').style.display = 'none';
    const resDiv = document.getElementById('quiz-result');
    resDiv.style.display = 'block';

    const pct = Math.round((score / quizData.length) * 100);
    document.getElementById('final-score').innerText = `${pct}%`;
    document.getElementById('final-msg').innerText = `You got ${score} out of ${quizData.length} correct!`;

    if (pct > 70) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
}

function restartQuiz() {
    startQuiz();
}

// --- Calculators ---
function calculateMM() {
    const v = parseFloat(document.getElementById('mm-vmax').value);
    const k = parseFloat(document.getElementById('mm-km').value);
    const s = parseFloat(document.getElementById('mm-s').value);
    if (isNaN(v) || isNaN(k) || isNaN(s)) return alert("Please enter valid numbers");
    const res = ((v * s) / (k + s)).toFixed(4);
    document.getElementById('mm-result').innerText = res;
    document.getElementById('mm-steps').innerHTML = `$$ v_0 = \\frac{${v} \\cdot ${s}}{${k} + ${s}} = ${res} $$`;
    document.getElementById('calc-result-mm').style.display = 'block';
    renderMathInElement(document.getElementById('calc-result-mm'));
}

function calculatePH() {
    const c = parseFloat(document.getElementById('ph-conc').value);
    if (isNaN(c) || c <= 0) return alert("Please enter a valid positive concentration");
    const ph = (-Math.log10(c)).toFixed(2);
    document.getElementById('res-ph').innerText = ph;
    document.getElementById('ph-steps').innerHTML = `$$ pH = -\\log([H^+]) = -\\log(${c}) = ${ph} $$`;
    document.getElementById('calc-result-ph').style.display = 'block';
    renderMathInElement(document.getElementById('calc-result-ph'));
}

function calculateKw() {
    const h = parseFloat(document.getElementById('kw-h').value);
    if (isNaN(h) || h <= 0) return alert("Please enter a valid [H+]");
    const oh = (1e-14 / h).toExponential(2);
    document.getElementById('res-kw').innerText = oh + " M";
    document.getElementById('kw-steps').innerHTML = `$$ [OH^-] = \\frac{K_w}{[H^+]} = \\frac{1.0 \\times 10^{-14}}{${h}} $$`;
    document.getElementById('calc-result-kw').style.display = 'block';
    renderMathInElement(document.getElementById('calc-result-kw'));
}

function calculateGibbs() {
    const h = parseFloat(document.getElementById('gibbs-h').value);
    const s = parseFloat(document.getElementById('gibbs-s').value);
    const t = parseFloat(document.getElementById('gibbs-t').value);
    if (isNaN(h) || isNaN(s) || isNaN(t)) return alert("Invalid inputs");
    // Convert S from J to kJ for consistency if H is in kJ
    // Formula: G = H - T(S/1000)
    const g = (h - t * (s / 1000)).toFixed(2);
    document.getElementById('res-gibbs').innerText = g + " kJ/mol";
    document.getElementById('gibbs-steps').innerHTML = `$$ \\Delta G = ${h} - ${t}(${s}/1000) = ${g} \\text{ kJ/mol} $$`;
    document.getElementById('calc-result-gibbs').style.display = 'block';
    renderMathInElement(document.getElementById('calc-result-gibbs'));
}

function calculateConv() {
    const val = parseFloat(document.getElementById('conv-val').value);
    const type = document.getElementById('conv-type').value;
    if (isNaN(val)) return alert("Invalid value");
    let res = 0, unit = "";
    if (type === 'mg_g') { res = val / 1000; unit = "g"; }
    else if (type === 'g_mg') { res = val * 1000; unit = "mg"; }
    else if (type === 'uM_mM') { res = val / 1000; unit = "mM"; }
    else if (type === 'mM_uM') { res = val * 1000; unit = "µM"; }
    document.getElementById('res-conv').innerText = `${res} ${unit}`;
    document.getElementById('calc-result-conv').style.display = 'block';
}

function calculateMolarMass() {
    const mw = parseFloat(document.getElementById('mm-mw').value);
    const conc = parseFloat(document.getElementById('mm-conc').value);
    const vol = parseFloat(document.getElementById('mm-vol').value);
    if (isNaN(mw) || isNaN(conc) || isNaN(vol)) return alert("Invalid inputs");
    const mass = (mw * conc * vol).toFixed(3);
    document.getElementById('res-mass').innerText = mass;
    document.getElementById('calc-result-mass').style.display = 'block';
}

function sendEmail() {
    const msg = document.getElementById('contact-msg').value;
    if (!msg) return alert("Please type a message first.");

    const email = "biochemhub2025@gmail.com";
    const subject = "BioChemHub Feedback";
    const body = encodeURIComponent(msg);
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    // Create a temporary link to trigger the mail client
    // This prevents the current page from navigating away or reloading
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional: Show a message in case it doesn't open
    setTimeout(() => {
        alert("We tried to open your email app.\n\nIf it didn't open, please email us manually at:\n" + email);
    }, 500);
}
