import {
    playPause,
    progress,
    setProgressBufferPercentage,
    countTime,
    canPlay,
    volume,
    controlInputsToggle,
    playrate,
    sidebarToggle,
    progressInteration,
    blurSvgShow,
    showSubtitleConfig,
} from './puravita-utils';

window.addEventListener('load', () => {
    const player: any = document.getElementById('puravita-player');
    const video: any = document.getElementById('video-puravita');
    const buttonPlay = document.getElementById('play-puravita');
    const progressel = document.getElementById('puravita-progress');
    const progressbar = document.getElementById('puravita-progressbar');
    const progressbuffer = document.getElementById('puravita-progressbuffer');
    const timenumber = document.getElementById('puravita-time');
    const volumeinput = document.getElementById('puravita-volume');
    const playratelist = document.getElementById('puravita-rate-list');
    const playratelabel = document.getElementById('puravita-rate-label');
    const sidebarbutton = document.getElementById('puravita-sidebar-button');
    const sidebar = document.getElementById('puravita-sidebar');
    const controller = document.getElementById('puravita-controller');
    const svgBlurBox = document.getElementById('puravita-box-blur');
    const svgBlurBoxSVG = document.getElementById('puravita-box-blur-svg');
    const subtitleButton = document.getElementById('button-subtitle-trigger');
    const theCanvas = document.getElementById('the-canvas');

    playrate(playratelabel, playratelist, video);
    controlInputsToggle(player);
    progress(video, progressbar, timenumber);
    setProgressBufferPercentage(video, progressbuffer);
    playPause(video, buttonPlay);
    countTime(timenumber, 0, video.duration);
    volume(video, volumeinput);
    sidebarToggle(video, sidebarbutton, sidebar, controller);
    progressInteration(video, progressel, progressbar, timenumber);
    blurSvgShow(video, svgBlurBoxSVG, theCanvas);
    showSubtitleConfig(video, subtitleButton, svgBlurBox);
    canPlay(video, () => {
        countTime(timenumber, video.currentTime, video.duration);
    });
}, false);
