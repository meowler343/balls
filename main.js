var DEFAULT_LOCALE = 'ru';
var STORAGE_LOCALE_KEY = 'balls-simulation-locale';
var LOCALES = {
	ru: {
		name: 'Русский',
		translations: {
			'app.title': 'Симуляция шаров',
			'controls.radius': 'Радиус:',
			'controls.wallElasticity': 'Упругость стен:',
			'controls.airResistance': 'Сопротивление воздуха:',
			'controls.gravity': 'Гравитация:',
			'controls.glow': 'Свечение:',
			'controls.rgbMode': 'RGB Режим',
			'controls.pencil': '✏️ Рисовать блоки',
			'controls.vortex': '🌀 Чёрные дыры',
			'controls.clearBlocks': '🧹 Очистить блоки',
			'controls.clearVortexes': '🧹 Очистить дыры',
			'controls.clickDrag': 'Клик/перетаскивание для добавления',
			'controls.removeAll': 'Удалить все шары',
			'language.label': 'Язык',
			'links.githubRepo': 'Репозиторий GitHub',
			'modes.free': 'Свободный',
			'modes.fixed': 'Фиксированный',
			'modes.connected': 'Связанные',
			'modes.spring': 'Пружина'
		}
	},
	en: {
		name: 'English',
		translations: {
			'app.title': 'Balls Simulation',
			'controls.radius': 'Radius:',
			'controls.wallElasticity': 'Wall elasticity:',
			'controls.airResistance': 'Air resistance:',
			'controls.gravity': 'Gravity:',
			'controls.glow': 'Glow:',
			'controls.rgbMode': 'RGB Mode',
			'controls.pencil': '✏️ Draw Blocks',
			'controls.vortex': '🌀 Black Holes',
			'controls.clearBlocks': '🧹 Clear Blocks',
			'controls.clearVortexes': '🧹 Clear Holes',
			'controls.clickDrag': 'Click/Drag to add balls',
			'controls.removeAll': 'Remove All',
			'language.label': 'Language',
			'links.githubRepo': 'GitHub Repo',
			'modes.free': 'Free',
			'modes.fixed': 'Fixed',
			'modes.connected': 'Connected',
			'modes.spring': 'Spring'
		}
	},
	'zh-TW': {
		name: '正體中文',
		translations: {
			'app.title': '小球碰撞模擬',
			'controls.radius': '小球半徑：',
			'controls.wallElasticity': '牆壁恢復係數：',
			'controls.airResistance': '空氣阻力：',
			'controls.gravity': '重力加速度：',
			'controls.glow': '發光：',
			'controls.rgbMode': 'RGB 模式',
			'controls.pencil': '✏️ 繪製方塊',
			'controls.vortex': '🌀 黑洞模式',
			'controls.clearBlocks': '🧹 清除方塊',
			'controls.clearVortexes': '🧹 清除黑洞',
			'controls.clickDrag': '點擊/拖曳以新增小球',
			'controls.removeAll': '清除全部',
			'language.label': '語言',
			'links.githubRepo': 'GitHub 儲存庫',
			'modes.free': '獨立',
			'modes.fixed': '固定',
			'modes.connected': '連接',
			'modes.spring': '彈簧'
		}
	},
	'zh-CN': {
		name: '简体中文',
		translations: {
			'app.title': '小球碰撞模拟',
			'controls.radius': '小球半径：',
			'controls.wallElasticity': '墙壁恢复系数：',
			'controls.airResistance': '空气阻力：',
			'controls.gravity': '重力加速度：',
			'controls.glow': '发光：',
			'controls.rgbMode': 'RGB 模式',
			'controls.pencil': '✏️ 绘制方块',
			'controls.vortex': '🌀 黑洞模式',
			'controls.clearBlocks': '🧹 清除方块',
			'controls.clearVortexes': '🧹 清除黑洞',
			'controls.clickDrag': '点击/拖动以添加小球',
			'controls.removeAll': '清除全部',
			'language.label': '语言',
			'links.githubRepo': 'GitHub 代码仓库',
			'modes.free': '独立',
			'modes.fixed': '固定',
			'modes.connected': '连接',
			'modes.spring': '弹簧'
		}
	}
};

function getTranslation(locale, key)
{
	var localeTranslations = LOCALES[locale] && LOCALES[locale].translations;
	var fallbackTranslations = LOCALES[DEFAULT_LOCALE].translations;
	return (localeTranslations && localeTranslations[key]) || fallbackTranslations[key] || '';
}

function normalizeLocale(locale)
{
	if (!locale)return DEFAULT_LOCALE;
	var lowerLocale = locale.toLowerCase();
	if (lowerLocale.indexOf('ru') == 0)return 'ru';
	if (lowerLocale == 'zh-tw' || lowerLocale == 'zh-hk' || lowerLocale == 'zh-mo' || lowerLocale.indexOf('zh-hant') == 0)return 'zh-TW';
	if (lowerLocale == 'zh-cn' || lowerLocale == 'zh-sg' || lowerLocale.indexOf('zh-hans') == 0)return 'zh-CN';
	if (lowerLocale.indexOf('zh') == 0)return 'zh-TW';
	if (lowerLocale.indexOf('en') == 0)return 'en';
	return LOCALES[locale] ? locale : DEFAULT_LOCALE;
}

function detectBrowserLocale()
{
	var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
	for (var i=0; i<languages.length; i++)
	{
		var locale = normalizeLocale(languages[i]);
		if (LOCALES[locale])return locale;
	}
	return DEFAULT_LOCALE;
}

function getSavedLocale()
{
	try { return localStorage.getItem(STORAGE_LOCALE_KEY); }
	catch(e) { return null; }
}

function saveLocale(locale)
{
	try { localStorage.setItem(STORAGE_LOCALE_KEY, locale); }
	catch(e) {}
}

function applyLocale(locale)
{
	locale = normalizeLocale(locale);
	document.documentElement.lang = locale;
	document.querySelectorAll('[data-i18n]').forEach(function(element) {
		element.textContent = getTranslation(locale, element.getAttribute('data-i18n'));
	});
	document.querySelectorAll('[data-i18n-value]').forEach(function(element) {
		element.value = getTranslation(locale, element.getAttribute('data-i18n-value'));
	});
	document.querySelectorAll('[data-i18n-aria-label]').forEach(function(element) {
		element.setAttribute('aria-label', getTranslation(locale, element.getAttribute('data-i18n-aria-label')));
	});
	var languageSelect = document.getElementById('languageSelect');
	if (languageSelect)languageSelect.value = locale;
}

function populateLanguageSelect(languageSelect)
{
	languageSelect.innerHTML = '';
	for (var locale in LOCALES)
	{
		if (LOCALES.hasOwnProperty(locale))
		{
			var option = document.createElement('option');
			option.value = locale;
			option.textContent = LOCALES[locale].name;
			languageSelect.appendChild(option);
		}
	}
}

function initI18n()
{
	var languageSelect = document.getElementById('languageSelect');
	if (languageSelect)populateLanguageSelect(languageSelect);
	var locale = normalizeLocale(getSavedLocale() || detectBrowserLocale());
	applyLocale(locale);
	if (languageSelect)
	{
		languageSelect.addEventListener('change', function(e) {
			var selectedLocale = normalizeLocale(e.target.value);
			saveLocale(selectedLocale);
			applyLocale(selectedLocale);
		});
	}
}

window.addEventListener('DOMContentLoaded', function()
{
	initI18n();
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	window.addEventListener('resize',resizeCanvas);
	resizeCanvas();
	
	document.getElementById('Slider1').addEventListener('input',function(e){
		renderer.Slider1Changed(e.target.value*1);
	});
	
	document.getElementById('Slider2').addEventListener('input',function(e){
		renderer.Slider2Changed(e.target.value*1);
	});
	
	document.getElementById('Slider3').addEventListener('input',function(e){
		renderer.Slider3Changed(e.target.value*1);
	});
	
	document.getElementById('Slider4').addEventListener('input',function(e){
		renderer.Slider4Changed(e.target.value*1);
	});

	document.getElementById('SliderGlow').addEventListener('input',function(e){
		renderer.SliderGlowChanged(e.target.value*1);
	});

	document.getElementById('switchRGB').addEventListener('change',function(e){
		renderer.rgbModeChanged(e.target.checked);
	});

	var btnPencil = document.getElementById('btnPencil');
	var btnVortex = document.getElementById('btnVortex');

	btnPencil.addEventListener('click', function(e){
		renderer.draw_block_mode = !renderer.draw_block_mode;
		if (renderer.draw_block_mode) {
			btnPencil.classList.add('active');
			renderer.draw_vortex_mode = false;
			btnVortex.classList.remove('active-vortex');
		} else {
			btnPencil.classList.remove('active');
		}
	});

	btnVortex.addEventListener('click', function(e){
		renderer.draw_vortex_mode = !renderer.draw_vortex_mode;
		if (renderer.draw_vortex_mode) {
			btnVortex.classList.add('active-vortex');
			renderer.draw_block_mode = false;
			btnPencil.classList.remove('active');
		} else {
			btnVortex.classList.remove('active-vortex');
		}
	});

	document.getElementById('btnClearBlocks').addEventListener('click', function(e){
		renderer.clearBlocks();
	});

	document.getElementById('btnClearVortexes').addEventListener('click', function(e){
		renderer.clearBlackHoles();
	});
	
	document.getElementById('btnRestart').addEventListener('click',function(e){
		renderer.btnRestartClicked();
	});
	
	document.getElementById('stepperUp').addEventListener('click',function(e){
		renderer.btnAddClicked();
	});
	
	document.getElementById('stepperDown').addEventListener('click',function(e){
		renderer.btnRemoveClicked();
	});
	
	document.getElementById('segment1').addEventListener('click',function(e){
		renderer.segmentedChanged(0);
	});
	
	document.getElementById('segment2').addEventListener('click',function(e){
		renderer.segmentedChanged(1);
	});
	
	document.getElementById('segment3').addEventListener('click',function(e){
		renderer.segmentedChanged(2);
	});
	
	document.getElementById('segment4').addEventListener('click',function(e){
		renderer.segmentedChanged(3);
	});
	
	document.getElementById('switch1').addEventListener('click',function(e){
		var mSwitch=e.target;
		renderer.touchModeChanged(mSwitch.checked ? 1 : 0);
	});
	
	window.addEventListener('devicemotion', function(e) {
		if(e.accelerationIncludingGravity.x && e.accelerationIncludingGravity.y)renderer.accelerometer(e.accelerationIncludingGravity);
	});	
	
	dragging=false;
	
	canvas.addEventListener('mousedown', function(e) {
		e.preventDefault();
		renderer.touchesBegan(0,e.pageX,e.pageY);
		dragging=true;
	});	
	
	canvas.addEventListener('mousemove', function(e) {
		e.preventDefault();
		if(dragging)renderer.touchesMoved(0,e.pageX,e.pageY);
	});	
	
	canvas.addEventListener('mouseup', function(e) {
		e.preventDefault();
		renderer.touchesEnded(0,e.pageX,e.pageY);
		dragging=false;
	});	
	
	touch_id=[];
	for(var i=0; i<10; i++) { touch_id[i]=-1; }
	
	canvas.addEventListener('touchstart', function(e) {
		e.preventDefault();
		var touches = e.changedTouches;
		for (var n=0;n<touches.length;n++) {
			var touch=touches[n];
			var i=touch_id.indexOf(-1);
			if(i==-1)return;
			touch_id[i]=touch.identifier;
			renderer.touchesBegan(i,touch.pageX,touch.pageY);
		}
	});	
	
	canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		var touches = e.changedTouches;
		for (var n=0;n<touches.length;n++) {
			var touch=touches[n];
			renderer.touchesMoved(touch_id.indexOf(touch.identifier),touch.pageX,touch.pageY);
		}
	});	
	
	canvas.addEventListener('touchend', function(e) {
		e.preventDefault();
		var touches = e.changedTouches;
		for (var n=0;n<touches.length;n++) {
			var touch=touches[n];
			var i=touch_id.indexOf(touch.identifier);
			touch_id[i]=-1;
			renderer.touchesEnded(i,touch.pageX,touch.pageY);
		}
	});	
	
	canvas.addEventListener('touchcancel', function(e) {
		e.preventDefault();
		var touches = e.changedTouches;
		for (var n=0;n<touches.length;n++) {
			var touch=touches[n];
			var i=touch_id.indexOf(touch.identifier);
			touch_id[i]=-1;
			renderer.touchesEnded(i,touch.pageX,touch.pageY);
		}
	});	
	
	renderer.init();
	window.requestAnimationFrame(drawView);
});

function resizeCanvas()
{
	canvas.width = document.getElementById('panel').offsetWidth;
	canvas.height = document.getElementById('panel').offsetTop;
}

function drawView()
{
	renderer.render();
	window.requestAnimationFrame(drawView);
}