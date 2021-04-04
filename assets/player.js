async function init() {
  const video = document.querySelector('video');
  const ui = video['ui'];
  const config = {
    'controlPanelElements': ['play_pause', 'time_and_duration', 'spacer', 'mute', 'volume', 'overflow_menu', 'fullscreen'],
    'overflowMenuButtons': ['loop', 'quality', 'picture_in_picture'],
    'addBigPlayButton': false,
  };
  ui.configure(config);
}

document.addEventListener('shaka-ui-loaded', init);