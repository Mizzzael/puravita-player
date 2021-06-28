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
    showSubtitleConfig,
    setInputsColor,
    setInputSizeSubtitle,
    addComment,
    saveComment,
    iniLoadingAnimation,
    hideLoading,
    showLoading,
    defineDimension,
    loadSubtitles,
    subtitleInit,
    searchInput,
    chromecast,
    initChromecastAnimation,
    progressBoxManipulation,
    disableLabelsTrigger,
    setResolution,
} from './puravita-utils';

window.addEventListener('load', () => {
    const targetPlayer = document.getElementById('player-target');
    const player: any = document.getElementById('puravita-player');
    const video: any = document.getElementById('video-puravita');
    const buttonPlay = document.getElementById('play-puravita');
    const progressel = document.getElementById('puravita-progress');
    const progressbar = document.getElementById('puravita-progressbar');
    const progressbuffer = document.getElementById('puravita-progressbuffer');
    const progressBox = document.getElementById('puravita-progressbar-box');
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
    const subtitlecontrols = document.getElementById('puravita-control-subtitles');
    const subtitleColorsInput: Array<HTMLElement> = [document.getElementById('yellow'), document.getElementById('colors')];
    const subtitle = document.getElementById('puravita-controller-subtitle');
    const subtitleSize = document.getElementById('subtitle-size');
    const nameVideo = document.getElementById('puravita-name');
    const barbox = document.getElementById('puravita-progress_timeline-items');
    const chatBox = document.getElementById('chat-items');
    const chatTagTextarea = document.getElementById('form-input-data');
    const chatInput = document.getElementById('cutesexyrobutts-input-1');
    const chatTextarea = document.getElementById('cutesexyrobutts-textarea-1');
    const chatSubmit = document.getElementById('chat-form-submit');
    const loading = document.getElementById('puravita-loading');
    const inputSearch = document.getElementById('puravita-search-input');
    const controlSearch = document.getElementById('puravita-control-search');
    const buttonChromecast = document.getElementById('puravita-chromecast-button');
    const chromecastAnimation = document.getElementById('puravita-chromecast');
    const resolutionList = document.getElementById('resolution-list');
    const resolutionLabel = document.getElementById('resolution-label');

    const listResolutions = new Map();
    listResolutions.set('cutesexyrobutts-resolution-720p', 'https://mizzzael.github.io/puravita-player/assets/video/The%20Largest%20Star%20in%20the%20Universe%20–%20Size%20Comparison%20720p.mp4');
    listResolutions.set('cutesexyrobutts-resolution-480p', 'https://mizzzael.github.io/puravita-player/assets/video/The%20Largest%20Star%20in%20the%20Universe%20–%20Size%20Comparison%20480p.mp4');

    defineDimension(targetPlayer, player);
    setInputSizeSubtitle((video as HTMLVideoElement), (subtitleSize as HTMLInputElement), subtitle);
    setInputsColor((video as HTMLVideoElement), subtitleColorsInput, subtitle);
    playrate(playratelabel, playratelist, video);
    controlInputsToggle(player, nameVideo);
    progress(video, progressbar, timenumber, loading);
    setProgressBufferPercentage(video, progressbuffer);
    playPause(video, buttonPlay);
    countTime(timenumber, 0, video.duration);
    volume(video, volumeinput);
    disableLabelsTrigger((video as HTMLVideoElement), player);
    setResolution((video as HTMLVideoElement), resolutionList, listResolutions, resolutionLabel);
    sidebarToggle(
        video,
        sidebarbutton,
        (buttonPlay as HTMLButtonElement),
        sidebar,
        controller,
        (chatTagTextarea as HTMLInputElement),
        (chatInput as HTMLInputElement),
    );
    progressInteration(
        video,
        progressel,
        progressbar,
        timenumber,
    );
    showSubtitleConfig(
        video,
        subtitleButton,
        svgBlurBox,
        subtitlecontrols,
        svgBlurBoxSVG,
        theCanvas,
    );
    saveComment(barbox,
        chatBox,
        sidebarbutton,
        (chatInput as HTMLInputElement),
        (chatTextarea as HTMLTextAreaElement),
        (chatSubmit as HTMLButtonElement),
        (video as HTMLVideoElement),
        {
            id: '1',
            avatar: 'assets/images/avatar/1.webp',
            username: 'o inominável',
        });
    iniLoadingAnimation((video as HTMLVideoElement), loading);
    initChromecastAnimation((video as HTMLVideoElement), chromecastAnimation);
    loadSubtitles(video, 'https://mizzzael.github.io/puravita-player/assets/subtitles/The%20Largest%20Star%20in%20the%20Universe%20–%20Size%20Comparison.por.por.srt');
    progressBoxManipulation((video as HTMLVideoElement), progressBox);
    subtitleInit(video, subtitle);
    searchInput(
        (video as HTMLVideoElement),
        (inputSearch as HTMLInputElement),
        svgBlurBoxSVG,
        theCanvas,
        svgBlurBox,
        controlSearch,
    );
    canPlay(video, () => {
        countTime(timenumber, video.currentTime, video.duration);
        addComment(barbox, chatBox, video, sidebarbutton, {
            id: '1',
            avatar: 'assets/images/avatar/1.webp',
            comment: 'Importante: Lorem ipsum dolor sit amet consectetur.',
            time: 40.32153,
            username: 'o inominável',
        });

        addComment(barbox, chatBox, video, sidebarbutton, {
            id: '2',
            avatar: 'assets/images/avatar/1.webp',
            comment: 'Importante: Lorem ipsum dolor sit amet consectetur.2',
            time: 72.32153,
            username: 'o inominável',
        });

        addComment(barbox, chatBox, video, sidebarbutton, {
            id: '3',
            avatar: 'assets/images/avatar/1.webp',
            comment: 'Importante: Lorem ipsum dolor sit amet consectetur.',
            time: 160.32153,
            username: 'o inominável',
        });
        hideLoading(loading);
    });
    chromecast((video as HTMLVideoElement), buttonChromecast);
}, false);
