function Data4Thesis(url) {
  this.data = {
    datetime: (new Date()).toJSON(),
    basic: {
      browser: navigator.appCodeName,
      os: navigator.platform,
      screen: {
        width: screen.width,
        height: screen.height
      },
      browserVersion: navigator.appVersion,
      loadingTime: 0,
      language: navigator.language,
      isMobile: (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),
      webxr: (navigator.xr && navigator.xr.isSessionSupported('immersive-vr').value),
      webvr: (typeof(navigator.getVRDisplays) !== 'undefined')
    },
    extended: {},
    errors: '',
    rating: 0
  }
  const timers = {}

  this.set = (key, val) => {
    this.data.extended[key] = val;
  }

  this.incr = (key) => {
    if (!this.data.extended[key]) {
      this.data.extended[key] = 1;
      return;
    }
    this.data.extended[key]++;
  }

  this.startTimer = (key) => {
    if (!this.data.extended[key]) {
      this.data.extended[key] = 0;
    }
    timers[key] = {
      obj: setInterval(() => {
        if (!timers[key].isPaused) {
          this.data.extended[key]++;
        }
      }, 1),
      isPaused: false
    }
  }

  this.stopTimer = (key) => {
    clearInterval(timers[key]);
  }

  this.sendData = () => {
    console.log('data4thesis', 'send ajax data');
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(this.data));
  }

  const pauseAllTimers = () => {
    for (timer in timers) {
      timer.isPaused = true;
    }
  }

  const restartAllTimers = () => {
    for (timer in timers) {
      timer.isPaused = false;
    }
  }

  const visibilityHandler = (event) => {
    if (document.visibilityState === 'visible') {
      restartAllTimers();
    }
    else {
      pauseAllTimers();
    }
  }

  const errorHandler = (msg, url, lineNo) => {
    this.data.errors += text + ' [' + url + ':' + lineNo + ']\n';
  }

  // send data before close
  // window.addEventListener("unload", this.sendData);
  // log errors
  window.addEventListener("error", this.errorHandler);
  // stop timers if page not active
  document.addEventListener("visibilitychange", visibilityHandler);
}

Data4Thesis.prototype.closeStarRating = function () {
  if (this.modal) {
    document.body.removeChild(this.modal);
  }
}

Data4Thesis.prototype.showStarRating = function (name, surveyUrl, githubUrl) {
  const CSS_STYLE = `
.d4t-modal {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
box-sizing: border-box;
background: rgba(0, 0, 0, 0.5);
overflow: auto;
z-index: 100000;
}
.d4t-modal .question,
.d4t-modal .content {
text-align: center;
margin-bottom: 1rem;
}
.d4t-modal .d4t--container {
display: flex;
justify-content: center;
align-items: center;
min-height: 100vh;
}
.d4t-modal .d4t--box {
padding: 2rem;
background: #fff;
width: 100%;
max-width: 450px;
margin: 1rem 0;
border-radius: 4px;
}
.d4t-modal .d4t--box .question {
font-size: 150%;
}
.d4t-modal .d4t--box .stars {
display: inline-flex;
justify-content: center;
direction: rtl;
}
.d4t-modal .d4t--box .stars button {
display: block;
background: #fff;
border: none;
padding: 0;
font-size: 45px;
cursor: pointer;
}
.d4t-modal .d4t--box .stars button,
.d4t-modal .d4t--box .stars:hover button {
color: #000;
}
.d4t-modal .d4t--box .stars button i:before,
.d4t-modal .d4t--box .stars:hover button i:before{
content: "\\f006";
}
.d4t-modal .d4t--box .stars > button:hover,
.d4t-modal .d4t--box .stars > button:hover ~ button,
.d4t-modal .d4t--box .stars:not(.hover) > button.selected,
.d4t-modal .d4t--box .stars:not(.hover) > button.selected ~ button {
color: royalblue;
}
.d4t-modal .d4t--box .stars:not(.hover) > button.selected i:before,
.d4t-modal .d4t--box .stars:not(.hover) > button.selected ~ button i:before {
content: "\\f005";
}
.d4t-modal .d4t--box .info {
padding: 1rem;
font-size: 16px;
border: 1px solid grey;
border-radius: 4px;
}
.d4t-modal .columns {
display: flex;
}
.d4t-modal .columns .column {
flex: 1 1 auto;
padding: 0.25rem;
}
.d4t-modal .button, .d4t-modal a.button {
display: block;
padding: 0.5rem 0.25rem;
background: royalblue;
border: none;
border-radius: 4px;
font-size: 18px;
color: #fff;
text-align: center;
text-decoration: none;
}
.d4t-modal button.button {
width: 100%;
}
.d4t-modal .button:hover {
background: grey;
cursor: pointer;
}
.d4t-modal .footer {
padding-top: 1rem;
}
  `;
  if (this.rating > 0) {
    return;
  }
  if (!this._cssLoaded) {
    // load icon font for star rating
    const faCssLink = document.createElement('link');
    faCssLink.setAttribute('rel', 'stylesheet');
    faCssLink.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css');
    document.head.appendChild(faCssLink);

    const mainCss = document.createElement('style');
    mainCss.type = 'text/css';
    if (mainCss.styleSheet) {
      mainCss.styleSheet.cssText = CSS_STYLE;
    }
    else {
      mainCss.appendChild(document.createTextNode(CSS_STYLE));
    }
    document.head.appendChild(mainCss);

    this._cssLoaded = true;
  }
  if (!this.modal) {
    this.modal = document.createElement('div');
    this.modal.classList.add('d4t-modal');
    this.modal.innerHTML = `
      <div class="d4t--container">
        <div class="d4t--box">
          <div class="question">How did you like the ${name}?</div>
          <div class="content">
            <div class="stars">
              <button data-stars="5"><i class="fa"></i></button>
              <button data-stars="4"><i class="fa"></i></button>
              <button data-stars="3"><i class="fa"></i></button>
              <button data-stars="2"><i class="fa"></i></button>
              <button data-stars="1"><i class="fa"></i></button>
            </div>
          </div>
          <div class="info">
            Help to improve the ${name} by answering further questions in a survey or report issues on GitHub.
            <div style="margin-top: 0.5rem;" class="columns">
              <div class="column">
                <a class="button" target="_blank" href="${surveyUrl}">Show survey</a>
              </div>
              <div class="column">
                <a class="button" target="_blank" href="${githubUrl}">Report issue</a>
              </div>
            </div>
          </div>
          <div class="footer">
            <button class="button close-trigger">Close</button>
          </div>
        </div>
      </div>
    `;
  }
  document.body.appendChild(this.modal);

  // init star rating
  const stars = document.querySelector('.d4t-modal .stars');
  stars.onmouseover = () => {
    stars.classList.add('hover');
  }
  stars.onmouseleave = () => {
    stars.classList.remove('hover');
  }
  const starsBtns = document.querySelectorAll('.d4t-modal .stars button');
  for (const btn of starsBtns) {
    btn.onclick = (event) => {
      const el = event.currentTarget;
      this.data.rating = el.dataset.stars;
      stars.classList.remove('hover');
      for (const b of starsBtns) {
        b.classList.remove('selected');
      }
      el.classList.add('selected');
    };
  }

  // init close
  const closeBtn = document.querySelector('.d4t-modal .close-trigger');
  closeBtn.onclick = () => {
    this.closeStarRating();
    this.sendData();
  }
}

export default Data4Thesis;
