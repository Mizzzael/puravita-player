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
} from './puravita-utils';

window.addEventListener('load', () => {
    const player: any = document.getElementById('puravita-player');
    const video: any = document.getElementById('video-puravita');
    const buttonPlay = document.getElementById('play-puravita');
    const progressbar = document.getElementById('puravita-progressbar');
    const progressbuffer = document.getElementById('puravita-progressbuffer');
    const timenumber = document.getElementById('puravita-time');
    const volumeinput = document.getElementById('puravita-volume');
    const playratelist = document.getElementById('puravita-rate-list');
    const playratelabel = document.getElementById('puravita-rate-label');
    const sidebarbutton = document.getElementById('puravita-sidebar-button');
    const sidebar = document.getElementById('puravita-sidebar');
    const controller = document.getElementById('puravita-controller');

    playrate(playratelabel, playratelist, video);
    controlInputsToggle(player);
    progress(video, progressbar, timenumber);
    setProgressBufferPercentage(video, progressbuffer);
    playPause(video, buttonPlay);
    countTime(timenumber, 0, video.duration);
    volume(video, volumeinput);
    sidebarToggle(video, sidebarbutton, sidebar, controller);
    canPlay(video, () => {
        countTime(timenumber, 0, video.duration);
    });
}, false);
