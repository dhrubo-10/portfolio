(function () {
    var $ = function (s) { return document.querySelector(s); };

    function tick() {
        $('#clock').textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' });
    }
    tick(); setInterval(tick, 10000);


    var TREE = {
        id: 'root', sub: 'PID 1', label: 'init', k: 'the parent process', h: 'init — where everything forks from',
        p: 'An accountant who kept asking what the machine underneath is actually doing. Every branch below started from that question.',
        kids: [
            {
                id: 'num', sub: 'fork()', label: 'numbers', k: 'branch', h: 'The numbers side',
                p: 'Getting figures exactly right, and understanding the math that models them.',
                kids: [
                    {
                        id: 'acct', label: 'Accounting & audit', k: 'foundation', h: 'Accounting & audit',
                        p: 'BBA in Accounting at IIUC, interning on live audit work ISA, IFRS, materiality, analytical procedures. The discipline of getting numbers exactly right.'
                    },
                    {
                        id: 'ml', label: 'ML foundations', k: "what's next", h: 'ML foundations',
                        p: 'Working through the math under machine learning vectors, matrices, probability, now calculus before touching the libraries.'
                    }
                ]
            },
            {
                id: 'mach', sub: 'fork()', label: 'machine', k: 'branch', h: 'The machine side',
                p: 'Everything from the bare board up to the browser.',
                kids: [
                    {
                        id: 'metal', label: 'bare metal', k: 'branch', h: 'Bare metal', p: 'Where there is no operating system yet — you write it.',
                        kids: [
                            {
                                id: 'os', label: 'Kernel & OS dev', k: 'the deep end', h: 'Kernel & OS development',
                                p: 'baSic_ -> a custom x86 kernel built from bootloader to syscalls  plus Linux kernel module work: task_struct, process lists and building vmlinux from source.'
                            },
                            {
                                id: 'emb', label: 'Embedded systems', k: 'closer to metal', h: 'Embedded systems',
                                p: 'STM32 Blue Pill, ARM Cortex-M, registers and GPIO the same instincts as kernel work, applied to a board instead of a desktop.'
                            }
                        ]
                    },
                    {
                        id: 'soft', label: 'software', k: 'branch', h: 'Software', p: 'The layers people actually use, and pay for.',
                        kids: [
                            {
                                id: 'c', label: 'C & data structures', k: 'building blocks', h: 'C & data structures',
                                p: "Implementation-first: linked lists, binary search, Kadane's algorithm, and working DSA problems in raw C before reaching for anything higher-level."
                            },
                            {
                                id: 'web', label: 'Web & freelance', k: 'making it pay', h: 'Web & freelance',
                                p: 'Full-stack work in Django, Flask, JavaScript and React the practical, income facing side, and the seed of a project called SysForge.'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    var tree = $('#tree'), detail = $('#detail'), NS = 'http://www.w3.org/2000/svg', selected = 'acct', byId = {};

    function build(n) {
        byId[n.id] = n;
        var b = document.createElement('div'); b.className = 'branch';
        var t = document.createElement('button');
        t.className = 'tnode' + (n.id === 'root' ? ' root' : ''); t.dataset.id = n.id;
        t.innerHTML = (n.sub ? '<i>' + n.sub + '</i>' : '') + n.label;
        t.addEventListener('click', function () { select(n.id); });
        b.appendChild(t);
        if (n.kids) {
            var k = document.createElement('div'); k.className = 'kids';
            n.kids.forEach(function (c) { k.appendChild(build(c)); });
            b.appendChild(k);
        }
        return b;
    }
    tree.appendChild(build(TREE));

    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'links draw'); tree.insertBefore(svg, tree.firstChild);
    function node(id) { return tree.querySelector('.tnode[data-id="' + id + '"]'); }

    function trail(id, n, acc) {
        acc = (acc || []).concat(n.id);
        if (n.id === id) return acc;
        for (var i = 0; n.kids && i < n.kids.length; i++) { var r = trail(id, n.kids[i], acc); if (r) return r; }
        return null;
    }
    function paint() {
        var on = trail(selected, TREE) || [];
        tree.querySelectorAll('.tnode').forEach(function (b) {
            b.classList.toggle('on', on.indexOf(b.dataset.id) > -1);
            b.classList.toggle('sel', b.dataset.id === selected);
        });
        svg.querySelectorAll('path').forEach(function (p) { p.classList.toggle('on', on.indexOf(p.dataset.to) > -1); });
    }
    function draw() {
        svg.innerHTML = '';
        var T = tree.getBoundingClientRect();
        svg.setAttribute('width', T.width); svg.setAttribute('height', T.height);
        (function walk(n) {
            (n.kids || []).forEach(function (c) {
                var a = node(n.id).getBoundingClientRect(), b = node(c.id).getBoundingClientRect();
                var x1 = a.left + a.width / 2 - T.left, y1 = a.bottom - T.top, x2 = b.left + b.width / 2 - T.left, y2 = b.top - T.top, m = (y1 + y2) / 2;
                var p = document.createElementNS(NS, 'path');
                p.setAttribute('d', 'M' + x1 + ' ' + y1 + 'C' + x1 + ' ' + m + ',' + x2 + ' ' + m + ',' + x2 + ' ' + y2);
                p.setAttribute('pathLength', '1'); p.dataset.to = c.id; svg.appendChild(p);
                walk(c);
            });
        })(TREE);
        paint();
    }
    function select(id) {
        selected = id; paint();
        var d = byId[id];
        detail.innerHTML = '<span class="k"></span><h3></h3><p></p>';
        detail.querySelector('.k').textContent = d.k; detail.querySelector('h3').textContent = d.h; detail.querySelector('p').textContent = d.p;
    }
    select(selected);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw);
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { svg.classList.remove('draw'); draw(); }, 100); });


    var SPECS = {
        monitor: { k: 'display', t: 'ViewSonic VX227', rows: [['OS', 'Windows 11 + KDE neon (dual boot)']] },
        cpu: { k: 'processor', t: 'AMD Ryzen 7 5700G', rows: [['Cores / threads', '8 / 16'], ['Architecture', 'Zen 3 (Cezanne)'], ['Integrated GPU', 'Radeon Vega 8']] },
        cooler: { k: 'cooling', t: 'DeepCool AG400', rows: [['Type', 'Air cooler']] },
        gpu: { k: 'graphics', t: 'RTX 4060', rows: [['VRAM', '8 GB'], ['Sits alongside', "5700G's Vega 8"]] },
        board: { k: 'motherboard', t: 'MSI A520M-A PRO', rows: [['Wi-Fi', 'Cudy adapter']] },
        ram: { k: 'memory', t: '16 GB DDR4', rows: [['Sticks', '2, dual-channel'], ['Speed', '3200 MT/s']] },
        storage: { k: 'storage', t: '512 GB SSD + 2 HDDs', rows: [['System drive', '512 GB SSD'], ['Bulk', '2 × HDD, 5400 RPM']] },
        psu: { k: 'power', t: 'Corsair CX650', rows: [['Output', '650 W'], ['Rating', '80+ Bronze']] },
        keyboard: { k: 'input', t: 'Keyboard', rows: [['Model', 'Fantech MK882 Pantheon Mechanical Keyboard']] },
        mouse: { k: 'input', t: 'Mouse', rows: [['Model', 'Fantech WG10 Raigor II Wireless Gaming Mouse']] },
        mousepad: { k: 'Fantech', t: 'MP806', rows: [['Size', '800 x 300 x 3mm']] },
        speakers: { k: 'audio', t: 'Speakers', rows: [['Model', 'Havit SK590']] },
        laptop: { k: 'second machine', t: 'Lenovo', rows: [['Processor Type', 'Intel Core i5-8260U 8th Generation'], ['RAM', '12GB DDR4'], ['Hard Disk', '256GB PCIe NVMe M.2'], ['OS', 'Linux Mint']] }
    };

    var scene = $('#scene'), card = $('#spec'), openPart = null;
    function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function show(part) {
        var d = SPECS[part.dataset.part]; if (!d) return;
        var hint = part.dataset.part === 'monitor' ? '<div class="hint">click to open shell</div>' : '';
        card.innerHTML = '<span class="k">' + esc(d.k) + '</span><h4>' + esc(d.t) + '</h4><dl>' +
            d.rows.map(function (r) { return '<div class="row"><dt>' + esc(r[0]) + '</dt><dd' + (r[1] ? '>' + esc(r[1]) : ' class="todo">add yours') + '</dd></div>'; }).join('') + '</dl>' + hint;
        card.hidden = false;
        var w = scene.getBoundingClientRect(), r = part.getBoundingClientRect(), cw = card.offsetWidth, ch = card.offsetHeight;
        var side = 'r', x = r.right - w.left + 14;
        if (x + cw > w.width) { side = 'l'; x = r.left - w.left - cw - 14; }
        if (x < 0) { side = 'r'; x = Math.min(Math.max(r.left - w.left, 0), w.width - cw); }   // small screens: do. overlay the part
        var y = Math.max(0, Math.min(r.top - w.top + r.height / 2 - ch / 2, w.height - ch));
        card.dataset.side = side; card.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    function hide() { card.hidden = true; if (openPart) { openPart.classList.remove('open'); openPart = null; } }

    scene.querySelectorAll('.part').forEach(function (p) {
        p.addEventListener('mouseenter', function () { show(p); });
        p.addEventListener('mouseleave', function () { if (openPart !== p) hide(); });
        p.addEventListener('focus', function () { show(p); });
        p.addEventListener('blur', hide);
        p.addEventListener('click', function (e) {          // tap for touchscreens
            e.stopPropagation();
            if (p.dataset.part === 'monitor') { hide(); openShell(); return; }
            if (openPart === p) { hide(); return; }
            hide(); openPart = p; p.classList.add('open'); show(p);
        });
    });
    document.addEventListener('click', function (e) {
        hide();
        if (!shell.hidden && !shell.contains(e.target)) closeShell();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!shell.hidden) { closeShell(); return; }
        hide();
    });

    var PROJECTS = ['baSic_/', 'FORGE/', 'embedded-stm32/', 'web-freelance/'];
    var shell = $('#shell'), shellOut = $('#shellOut'), shellIn = $('#shellInput'), screenEl = $('#screen');

    function shLine(text, cls) {
        var l = document.createElement('div'); l.className = 'ln' + (cls ? ' ' + cls : ''); l.textContent = text; shellOut.appendChild(l);
    }
    function runCmd(raw) {
        var cmd = raw.trim(), low = cmd.toLowerCase();
        var l = document.createElement('div'); l.className = 'ln cmd'; l.textContent = cmd; shellOut.appendChild(l);
        if (low === 'help') shLine('commands: whoami, ls, cat about.txt, forge log, clear, exit');
        else if (low === 'whoami') shLine('shahriar dhrubo — self-taught systems programmer, chattogram, bd');
        else if (low === 'ls' || low === 'ls projects' || low === 'ls -la') shLine(PROJECTS.join('  '));
        else if (low === 'cat about.txt') shLine('BBA student in accounting, self-taught in C and OS internals. Building an x86 kernel (baSic_) and freelancing full-stack on the side.');
        else if (low === 'forge log') {
            shLine('commit a91f2e0 (HEAD -> main)');
            shLine('Author: dhrubo <sdhrubo770@gmail.com>');
            shLine('');
            shLine('    fix: stopped losing commits to my own bugs');
        }
        else if (low === 'clear') shellOut.innerHTML = '';
        else if (low === 'exit') { closeShell(); return; }
        else if (low !== '') shLine('bash: ' + cmd.split(' ')[0] + ': command not found', 'err');
        shellOut.scrollTop = shellOut.scrollHeight;
    }
    function positionShell() {
        var w = scene.getBoundingClientRect(), r = screenEl.getBoundingClientRect();
        shell.style.width = r.width + 'px'; shell.style.height = r.height + 'px';
        shell.style.transform = 'translate(' + (r.left - w.left) + 'px,' + (r.top - w.top) + 'px)';
    }
    function openShell() {
        shell.hidden = false; positionShell();
        if (!shellOut.childElementCount) shLine('baSic_ shell — type "help" to get started.');
        shellIn.value = ''; shellIn.focus();
    }
    function closeShell() { shell.hidden = true; }
    shellIn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && shellIn.value.trim() !== '') { runCmd(shellIn.value); shellIn.value = ''; }
    });
    $('#shellClose').addEventListener('click', function (e) { e.stopPropagation(); closeShell(); });
    window.addEventListener('resize', function () { if (!shell.hidden) positionShell(); });


    var LAUNCH_DATE = new Date('2026-09-23T00:00:00+06:00');
    var upEl = $('#uptime');
    function pad(n) { return String(n).padStart(2, '0'); }
    function tickUptime() {
        var s = Math.max(0, Math.floor((Date.now() - LAUNCH_DATE) / 1000));
        var days = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        upEl.textContent = 'up ' + days + (days === 1 ? ' day, ' : ' days, ') + pad(h) + ':' + pad(m) + ':' + pad(sec);
    }
    tickUptime(); setInterval(tickUptime, 1000);
})();