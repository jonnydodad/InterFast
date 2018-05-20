// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function getMouseAngle(evt, centerX, centerY) {
  const x, y, mouseAngle;
  if (evt.screenX > centerX) {
    if (evt.screenY < centerY) {
      x = evt.screenX - centerX;
      y = centerY - evt.screenY;
      mouseAngle = Math.round(Math.atan(x/y) / Math.PI * 180);
    } else {
      x = evt.screenX - centerX;
      y = evt.screenY - centerY;
      mouseAngle = 90 + Math.round(Math.atan(y/x) / Math.PI * 180);
    } 
  } else {
    if (evt.screenY < centerY) {
      x = centerX - evt.screenX;
      y = centerY - evt.screenY;
      mouseAngle = 360 - Math.round(Math.atan(x/y) / Math.PI * 180);
    } else {
      x = centerX - evt.screenX;
      y = evt.screenY - centerY;
      mouseAngle = 180 + Math.round(Math.atan(x/y) / Math.PI * 180);
    } 
  }
  return mouseAngle;
}

export function getSettings(startAngle, sweepAngle) {
  const startTime = convertAngleToTime(startAngle);
  const endTime = convertAngleToTime(startAngle+sweepAngle);
  return [startTime, endTime];  
}

export function getTimeHours(time) {
  const hour = time.split(':')[0];
  const minute = time.split(':')[1];
  return Number(hour) + Number(minute)/60;
}

function convertAngleToTime(angle) {
  if (angle < 0) angle+=360;
  if (angle > 360) angle-=360;
  const hour = Math.floor(24 * angle / 360);
  const min = 60 * (angle - hour * 15) / 15; 
  return zeroPad(hour) + ':' + zeroPad(min);
}






