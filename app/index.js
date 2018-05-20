import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const digitalTime = document.getElementById("digital-time");
const hourHand = document.getElementById("hand-hours");
const minHand = document.getElementById("hand-mins");

const eatArcSetting = document.getElementById("arc-eat-setting");
const eatArcLive = document.getElementById("arc-eat-live");
const fastArcLive = document.getElementById("arc-fast-live");

const upperleft = document.getElementById("upperleft");
const clockPage = document.getElementById("clockPage");
const settingPage = document.getElementById("settingPage");

const btn8hr = document.getElementById("btn-8hr");
const btn11hr = document.getElementById("btn-11hr");

const eatarc = document.getElementById("eatarc");

const secondsArc = document.getElementById("arc-seconds");
const colors = ["#D11149", "#E6C229", "#6E0ECE", "#00D14C"]

let eatSettingStart = "00:00";
let eatSettingEnd = "08:00";
let today = new Date();

let state = 1;  // 1 for showing clockpage, -1 for showing setting page

settingPage.style.display = "none";


eatarc.onmousemove = function(evt) {
  const radius = eatarc.width/2;
  const centerX = eatarc.x + radius;
  const centerY = eatarc.y+ radius; 
  const mouseAngle = util.getMouseAngle(evt, centerX, centerY);
  eatarc.startAngle = mouseAngle  - eatarc.sweepAngle/2;
  [eatSettingStart, eatSettingEnd] = util.getSettings(eatarc.startAngle, eatarc.sweepAngle);
  
  document.getElementById("startText").text = eatSettingStart;
  document.getElementById("endText").text = eatSettingEnd; 
  return;
}



upperleft.onactivate = function(evt) {
  if (state === 1) {
    settingPage.style.display = "inline";
    
    clockPage.animate("enable");
    clockPage.style.display = "none";
    settingPage.animate("disable");
    
    
    state = -1;
  } else {
    updateArcs();
    clockPage.style.display = "inline";
    
    clockPage.animate("disable");
    settingPage.style.display = "none";
    settingPage.animate("enable");
    
    
    state = 1;
  }
  return;
}


btn8hr.onclick = function(evt) {
  eatarc.sweepAngle = 8/24*360;
  [eatSettingStart, eatSettingEnd] = util.getSettings(eatarc.startAngle, eatarc.sweepAngle);
  updateArcs();
}

btn11hr.onclick = function(evt) {
  eatarc.sweepAngle = 11/24*360;
  [eatSettingStart, eatSettingEnd] = util.getSettings(eatarc.startAngle, eatarc.sweepAngle);
  updateArcs();
}




// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

function minsToAngle(minutes) {
  return 6 * minutes;
}

// Rotate the hands every tick
function updateAnalog(evt) {
  if (!evt) {
    today = evt.date;
  }
  hourHand.groupTransform.rotate.angle = hoursToAngle(today.getHours(), today.getMinutes());
  minHand.groupTransform.rotate.angle = minsToAngle(today.getMinutes());
}

function updateArcs() {
  const currentHours = today.getHours() + today.getMinutes()/60;
  const eatStartHours = util.getTimeHours(eatSettingStart);
  const eatEndHours = util.getTimeHours(eatSettingEnd);
  let eatSettingStartAngle=0, eatSettingSweepAngle=0;
  let eatLiveStartAngle=0, eatLiveSweepAngle=0;
  let fastLiveStartAngle=0, fastLiveSweepAngle=0;
  calculate_eatSetting();
  calculate_live();

  eatArcSetting.startAngle = eatSettingStartAngle;
  eatArcSetting.sweepAngle = eatSettingSweepAngle;

  eatArcLive.startAngle = eatLiveStartAngle;
  eatArcLive.sweepAngle = eatLiveSweepAngle;

  fastArcLive.startAngle = fastLiveStartAngle;
  fastArcLive.sweepAngle = fastLiveSweepAngle;

  return;

  function calculate_eatSetting() {
    if (currentHours < 12) {  // am
      if (eatStartHours < 12) { // eat phase starts in am
        eatSettingStartAngle = 360/12 * eatStartHours;
        if (eatEndHours < 12 && eatEndHours > eatStartHours) {  // eat phase ends in am && duration <12h
          eatSettingSweepAngle = 360/12 * eatEndHours - eatSettingStartAngle;
        } else {  // eat phase ends in pm
          eatSettingSweepAngle = 360 - eatSettingStartAngle;
        }
      } else {   // eat phase starts in pm
        if (eatEndHours < 12) { // eat phase ends in am
          eatSettingSweepAngle = 360/12 * eatEndHours;
        } else if (eatEndHours < eatStartHours) { // 12 < eatEndHours < eatStartHours
          eatSettingSweepAngle = 360;
        }
      }
    } else {  // pm
      if (eatStartHours < 12) { // eat phase starts in am
        if (eatEndHours > 12) {
          eatSettingSweepAngle = 360/12 * (eatEndHours-12);
        } else if (eatEndHours < eatStartHours) { // eatEndHours < eatStartHours < 12
          eatSettingSweepAngle = 360;
        }
      } else {   // eat phase starts in pm
        eatSettingStartAngle = 360/12 * (eatStartHours-12);
        if (eatEndHours >= 12 && eatEndHours>eatStartHours) { // eat phase ends in pm && duration <12h
          eatSettingSweepAngle = 360/12 * (eatEndHours-12) - eatSettingStartAngle;
        } else { // eat phase ends in pm,
          eatSettingSweepAngle = 360 - eatSettingStartAngle;
        }
      }
    }
    return;
  }

  function calculate_live() {
    let currentAngle = 360/12 * currentHours;
    if (currentHours > 12) currentAngle-=360;

    fastLiveSweepAngle = currentAngle;
    eatLiveStartAngle = eatSettingStartAngle;

    if (currentAngle < (eatSettingStartAngle+eatSettingSweepAngle)) {
      eatLiveSweepAngle = currentAngle - eatSettingStartAngle;
    } else {
      eatLiveSweepAngle = eatSettingSweepAngle;
    }
    return;
  }
}

function secondsAnimation() {
  setInterval(function(){
    if(secondsArc.sweepAngle >= 360){
      secondsArc.style.fill = colors[Math.floor(Math.random() * colors.length)];
      secondsArc.sweepAngle = 3/5;
    } else {
      secondsArc.sweepAngle += 3/5
    }
  }, 100)  
}

// Update the clock every tick event
let secondsCircle;
clock.ontick = (evt) => {
  if (secondsCircle) clearInterval(secondsCircle);
  secondsCircle = secondsAnimation();
  updateAnalog(evt);
  updateArcs();
  sendNotification();
}



/*********************************************************************

Notification Modal

**********************************************************************/

let alarmPopup = document.getElementById("alarm-popup");
let dismissBtn = alarmPopup.getElementById("btn-dismiss");
let snoozeBtn = alarmPopup.getElementById("btn-snooze");
let fastAlert = document.getElementById("fast-text");
let eatAlert = document.getElementById("eat-text");


// Check for notification
function sendNotification() {
  // exit function if notificiation setting is disabled.
  // if(!notifications) return;
  
  // Else display appropriate pop up, if applicable. 
  let today = new Date();
  let hours = today.getHours();
  let mins = today.getMinutes();
  let eatingStart = util.getTimeHours(eatSettingStart);
  let eatingEnd = util.getTimeHours(eatSettingEnd);
    
  if((eatingStart) === (hours + mins / 60)) {
    // send notification for eating period starting
    alarmPopup.style.display = "inline";
    eatAlert.style.display = "inline";
  } else if((eatingEnd) === (hours + mins / 60)) {
    alarmPopup.style.display = "inline";
    fastAlert.style.display = "inline";
  }
}


snoozeBtn.onclick = function(evt) {
  alarmPopup.style.display = "none";
  
  // snooze for 8 minutes
  setTimeout(function() {
    alarmPopup.style.display = "inline"; 
  }, 10000);
}

dismissBtn.onclick = function(evt) {
  fastAlert.style.display = "none";
  eatAlert.style.display = "none";
  alarmPopup.style.display = "none";
}









