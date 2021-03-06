import { sha256 } from 'js-sha256';
import lottie from 'lottie-web';
import axios from 'axios';
import { timelineIco, chatSvgArrowIcon } from './els';
import { renderFunction } from './puravita-render';

const parser = require('subtitles-parser');
const CastJS = require('./cast');
const loadingData = require('./loading.json');
const chromecastAnimation = require('./chromecast.json');

const loadDataUrlSvg: Event = new Event('loadDataUrlSvg');
const subtitleConfigShow: Event = new Event('subtitleConfigShow');
const subtitleConfigHide: Event = new Event('subtitleConfigHide');
const buttonPressPlay: Event = new Event('buttonPressPlay');
const manualTimeUpdate: Event = new Event('manualTimeUpdate');
const showSidebar: Event = new Event('showSidebar');
const hideSidebar: Event = new Event('hideSidebar');
const showSearchSubtitle: Event = new Event('showSearchSubtitle');
const hideSearchSubtitle: Event = new Event('hideSearchSubtitle');
const chromecastCanPlay: Event = new Event('chromecastCanPlay');
const chromecastDontPlay: Event = new Event('chromecastDontPlay');
const chromecastOnPlay: Event = new Event('chromecastOnPlay');
const chromecastOnPause: Event = new Event('chromecastOnPause');
const chromecastOnEnd: Event = new Event('chromecastOnEnd');
const chromecastOnDisconnect: Event = new Event('chromecastOnDisconnect');
const chromecastButtonPlay_PausePressPause: Event = new Event('chromecastButtonPlay_PausePressPause');
const chromecastButtonPlay_PausePressPlay: Event = new Event('chromecastButtonPlay_PausePressPlay');
const chromecastOnConnect: Event = new Event('chromecastOnConnect');
const videoChangeResolution: Event = new Event('videoChangeResolution');
const cjs: any = new CastJS();

export interface Comment {
    id: string,
    avatar: string,
    comment: string,
    time: number,
    username: string
}

export interface Profile {
    id: string,
    avatar: string,
    username: string
}

const inputClose = (input: HTMLInputElement | any, inputs: NodeListOf<Element>) => {
    inputs.forEach((v) => {
        if (v != input) {
            (v as any).checked = false;
        }
    });
};

const controlInputsToggle = (player: HTMLElement, name: HTMLElement) => {
    const inputs = player.querySelectorAll('input[type="checkbox"]');
    const labels = player.querySelectorAll('label');
    document.addEventListener('click', () => {
        name.style.height = 'initial';
        inputs.forEach((v) => {
            (v as any).checked = false;
        });
    });

    labels.forEach((label) => {
        label.addEventListener('click', (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
        });
    });

    inputs.forEach((input) => {
        input.addEventListener('click', (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
            if ((input as any).checked && !(input as any).classList.contains('js-inative')) {
                inputClose(input, inputs);
            }
        });
    });

    inputs.forEach((input) => {
        input.addEventListener('change', () => {
            if ((input as any).checked && !(input as any).classList.contains('js-inative') && !(input as any).classList.contains('js-is-dropdown')) {
                name.style.height = '0';
            } else if (!(input as any).classList.contains('js-inative') && !(input as any).classList.contains('js-is-dropdown')) {
                name.style.height = 'initial';
            }
        });
    });
};

const playPause = (video: any, button: HTMLElement): void => {
    let waitClose = false;
    let chromecastIsPlayng = false;
    let chromecastPlay = false;
    video.addEventListener('pause', () => {
        video.classList.remove('puravita-play');
        button.classList.remove('is-active');
    });

    video.addEventListener('ended', () => {
        video.classList.remove('puravita-play');
    });

    video.addEventListener('play', () => {
        video.classList.add('puravita-play');
        button.classList.add('is-active');
    });

    video.addEventListener('chromecastOnPlay', () => {
        chromecastIsPlayng = true;
        chromecastPlay = true;
        video.classList.add('puravita-play');
        button.classList.add('is-active');
    });

    video.addEventListener('chromecastOnPause', () => {
        chromecastPlay = false;
        video.classList.remove('puravita-play');
        button.classList.remove('is-active');
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        chromecastIsPlayng = false;
        chromecastPlay = false;
        video.classList.remove('puravita-play');
        button.classList.remove('is-active');
    });

    video.addEventListener('chromecastOnEnd', () => {
        video.classList.remove('puravita-play');
        button.classList.remove('is-active');
    });

    video.addEventListener('chromecastCanPlay', () => {
        if (!video.paused) video.pause();
    });

    video.addEventListener('videoChangeResolution', () => {
        video.classList.remove('puravita-play');
        button.classList.remove('is-active');
    });

    video.addEventListener('subtitleConfigShow', () => {
        waitClose = true;
    });

    video.addEventListener('subtitleConfigHide', () => {
        waitClose = false;
    });

    button.addEventListener('click', (): void => {
        if (chromecastIsPlayng) {
            if (chromecastPlay) {
                video.dispatchEvent(chromecastButtonPlay_PausePressPause);
            } else {
                video.dispatchEvent(chromecastButtonPlay_PausePressPlay);
            }
            return;
        }
        if (waitClose) {
            video.dispatchEvent(buttonPressPlay);
            setTimeout(() => {
                video.play();
            }, 400);
            return;
        }
        if (video.classList.contains('puravita-play')) {
            video.pause();
        } else {
            video.play();
        }
    }, false);
};

const setProgressBufferPercentage = (video: HTMLVideoElement | any, progressbarbuffer: HTMLElement): void => {
    video.addEventListener('progress', () => {
        if (video.duration > 0) {
            for (let i = 0; i < video.buffered.length; i++) {
                if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
                    progressbarbuffer.style.width = `${(video.buffered.end(video.buffered.length - 1 - i) / video.duration) * 100}%`;
                    break;
                }
            }
        }
    }, false);
};

const setProgressPercentage = (progressbar: HTMLElement, video: HTMLVideoElement, currentTime: any): void => {
    const percentage = currentTime / (video.duration * 0.01);
    const width = `${percentage.toFixed(6)}%`;
    progressbar.style.width = width;
};

const progress = (video: HTMLVideoElement | any, progressbar: HTMLElement, time: HTMLElement, loading: HTMLElement): void => {
    let timeInterval: any | boolean = false;
    let timeCheckProgressTime: any = false;
    let checkChromecastConnection: boolean = false;
    let lastTimeUpdate: any = 0;
    let isLoadingNow = false;
    video.addEventListener('play', (): void => {
        hideLoading(loading);
        timeInterval = setInterval(() => {
            setProgressPercentage(progressbar, video, video.currentTime);
            countTime(time, video.currentTime, video.duration);
        });

        timeCheckProgressTime = setInterval(() => {
            if (lastTimeUpdate === video.currentTime && !video.paused) {
                if (!isLoadingNow) {
                    isLoadingNow = true;
                    showLoading(loading);
                }
            } else if (isLoadingNow) {
                hideLoading(loading);
                isLoadingNow = false;
            }
            lastTimeUpdate = video.currentTime;
        }, 300);
    });

    video.addEventListener('chromecastOnConnect', () => {
        checkChromecastConnection = true;
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        if (checkChromecastConnection) {
            checkChromecastConnection = false;
            setProgressPercentage(progressbar, video, video.currentTime);
            countTime(time, video.currentTime, video.duration);
        }
    });

    video.addEventListener('goToResultOfSearch', ({ detail }: any) => {
        setProgressPercentage(progressbar, video, detail.startTime / 1000);
        countTime(time, detail.startTime / 1000, video.duration);
    });

    video.addEventListener('pause', (): void => {
        if (timeInterval) {
            clearInterval(timeInterval);
            timeInterval = false;
        }

        if (timeCheckProgressTime) {
            clearInterval(timeCheckProgressTime);
            timeCheckProgressTime = false;
        }
    });

    video.addEventListener('ended', (): void => {
        if (timeInterval) {
            clearInterval(timeInterval);
            timeInterval = false;
        }

        if (timeCheckProgressTime) {
            clearInterval(timeCheckProgressTime);
            timeCheckProgressTime = false;
        }
    });
};

const subtitleInit = (video: HTMLVideoElement, subtitle: HTMLElement) => {
    let time: any = false;
    video.addEventListener('loadsubtitle', ({ detail }: any) => {
        const filterLegendsByPercentage: any = {};
        detail.forEach(({ startTime, endTime, text }: any) => {
            filterLegendsByPercentage[startTime.toString()] = {
                startTime,
                endTime,
                text,
            };
        });

        let subtitleOBJ: any = false;
        const onPlay = (customTime: any = false) => {
            let currentTime = '0';
            if (customTime) {
                currentTime = customTime;
            } else {
                currentTime = (video.currentTime * 1000).toFixed(0);
            }
            if (!subtitleOBJ) {
                Object.keys(filterLegendsByPercentage).forEach((key) => {
                    if (
                        parseInt(currentTime) >= filterLegendsByPercentage[key].startTime
                        && parseInt(currentTime) <= filterLegendsByPercentage[key].endTime
                    ) {
                        subtitleOBJ = filterLegendsByPercentage[key];
                        subtitle.innerText = subtitleOBJ.text.toString('utf-8');
                    }
                });
            } else if (
                subtitleOBJ
                && subtitleOBJ.endTime <= currentTime
                && subtitleOBJ.startTime <= currentTime
            ) {
                subtitleOBJ = false;
                subtitle.innerText = '';
            }
        };
        video.addEventListener('play', () => {
            time = setInterval(onPlay, 300);
        });

        video.addEventListener('goToResultOfSearch', ({ detail }: any) => {
            if (time) {
                clearInterval(time);
                time = false;
                subtitleOBJ = false;
                subtitle.innerText = '';
            }
            onPlay(detail.startTime);
        });

        video.addEventListener('pause', () => {
            console.log('%cPaused', 'font-size: 12px; padding: 10px 20px; color: #FFFFFF;background-color: red;');
            if (time) {
                clearInterval(time);
                time = false;
                subtitleOBJ = false;
                subtitle.innerText = '';
            }
        });

        video.addEventListener('ended', () => {
            if (time) {
                clearInterval(time);
                time = false;
                subtitleOBJ = false;
                subtitle.innerText = '';
            }
        });
    });
};

const formatedTime = (time: any) => {
    const sec_num: number = parseInt(time.toString(), 10);
    let hours: string | number = Math.floor(sec_num / 3600);
    let minutes: string | number = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: string | number = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = `0${hours}`; }
    if (minutes < 10) { minutes = `0${minutes}`; }
    if (seconds < 10) { seconds = `0${seconds}`; }

    return `${hours}:${minutes}:${seconds}`;
};

const countTime = (time: HTMLElement, currentTime: any, durationTime: any): void => {
    if (!durationTime) return;
    const timenumber: number = durationTime - currentTime;
    time.innerText = formatedTime(timenumber);
};

const canPlay = (video: HTMLVideoElement, callback = () => {}): void => {
    video.addEventListener('loadeddata', () => {
        callback();
    });

    if (video.duration) {
        callback();
    } else {
        video.load();
    }
};

const volume = (video: HTMLVideoElement, input: any): void => {
    video.volume = parseFloat(input.value);
    input.addEventListener('change', () => {
        video.volume = parseFloat(input.value);
    });
};

const playrate = (label: HTMLElement, list: HTMLElement, video: HTMLVideoElement): void => {
    list.querySelectorAll('li').forEach((li: HTMLElement) => {
        li.querySelector('label').addEventListener('click', (e) => {
            const value = parseFloat((e.target as any).getAttribute('data-value'));
            video.playbackRate = value;
            label.innerText = `${(e.target as any).getAttribute('data-value')}x`;
        });
    });
};

const sidebarToggle = (
    video: HTMLVideoElement,
    button: HTMLElement,
    playButton: HTMLButtonElement,
    sidebar: HTMLElement,
    controller: HTMLElement,
    chatTagTextarea: HTMLInputElement,
    chatInput: HTMLInputElement,
): void => {
    let isShow: boolean = false;
    button.addEventListener('click', () => {
        if (isShow) {
            isShow = false;
            sidebar.classList.remove('puravita-chat-sidebar-show');
            controller.classList.remove('puravita-controller-sidebar');
            button.classList.remove('is-active');
            playButton.disabled = false;
            playButton.style.opacity = '1';
            video.dispatchEvent(hideSidebar);
        } else {
            isShow = true;
            video.pause();
            sidebar.classList.add('puravita-chat-sidebar-show');
            controller.classList.add('puravita-controller-sidebar');
            button.classList.add('is-active');
            playButton.disabled = true;
            playButton.style.opacity = '0.4';
            video.dispatchEvent(showSidebar);
            chatTagTextarea.innerText = formatedTime(video.currentTime);
        }
        video.addEventListener('manualTimeUpdate', () => {
            chatInput.value = video.currentTime.toString();
            chatTagTextarea.innerText = formatedTime(video.currentTime);
        });
    }, false);

    video.addEventListener('chromecastOnConnect', () => {
        (button as HTMLButtonElement).disabled = true;
        button.style.opacity = '0.4';

        sidebar.classList.remove('puravita-chat-sidebar-show');
        controller.classList.remove('puravita-controller-sidebar');
        button.classList.remove('is-active');
        button.classList.add('is-blocked');
        playButton.disabled = false;
        playButton.style.opacity = '1';
        video.dispatchEvent(hideSidebar);
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        (button as HTMLButtonElement).disabled = false;
        button.classList.remove('is-blocked');
        button.style.opacity = '1';
    });
};

const progressInteration = (video: HTMLVideoElement, progressel: HTMLElement, progressbar: HTMLElement, time: HTMLElement): void => {
    let mousemove = false;
    progressel.addEventListener('mouseout', () => {
        mousemove = false;
        progressel.style.zIndex = '4';
    });

    progressel.addEventListener('mousedown', () => {
        mousemove = true;
        progressel.style.zIndex = '9';
    });

    progressel.addEventListener('mouseup', () => {
        mousemove = false;
        progressel.style.zIndex = '4';
    });

    progressel.addEventListener('mousemove', (e: any) => {
        if (!mousemove) return;
        video.pause();
        const { width } = progressel.getClientRects()[0];
        const { layerX } = e;
        const percentage = layerX / (width * 0.01);
        const { duration } = video;
        const minuteSet = (duration * 0.01) * percentage;
        setProgressPercentage(progressbar, video, minuteSet);
        video.currentTime = minuteSet;
        countTime(time, video.currentTime, duration);
        video.dispatchEvent(manualTimeUpdate);
    });

    progressel.addEventListener('click', (e: any) => {
        const { width } = progressel.getClientRects()[0];
        const { layerX } = e;
        const percentage = layerX / (width * 0.01);
        const { duration } = video;
        const minuteSet = (duration * 0.01) * percentage;
        setProgressPercentage(progressbar, video, minuteSet);
        video.pause();
        video.currentTime = minuteSet;
        countTime(time, video.currentTime, duration);
        video.dispatchEvent(manualTimeUpdate);
        video.play();
    });
};

const cropFrame = (video: HTMLVideoElement, svg: HTMLElement, theCanvas: any) => {
    const imageGamb = svg.querySelector('image');
    theCanvas.width = video.getClientRects()[0].width;
    theCanvas.height = video.getClientRects()[0].height;
    const ctx = theCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, theCanvas.width, theCanvas.height);
    imageGamb.setAttribute('xlink:href', theCanvas.toDataURL());
    video.dispatchEvent(loadDataUrlSvg);
};

const showSubtitleConfig = (
    video: HTMLVideoElement,
    buttonToggleShow: HTMLElement,
    boxTarget: HTMLElement,
    controlSubtitleBox: HTMLElement,
    svgBlurBoxSVG: HTMLElement,
    theCanvas: HTMLElement,
) => {
    const closeSubtitle = () => {
        if (buttonToggleShow.classList.contains('is-active')) {
            buttonToggleShow.classList.remove('is-active');
            boxTarget.style.zIndex = '4';
            boxTarget.classList.add('puravita-canvas_animation_hide');
            controlSubtitleBox.classList.add('puravita-canvas_subtitle_controls_hide');
            buttonToggleShow.classList.remove('is-active');
            video.dispatchEvent(subtitleConfigHide);
        }
    };

    const showSubtitle = () => {
        boxTarget.style.zIndex = '9';
        buttonToggleShow.classList.add('is-active');
        boxTarget.classList.remove('puravita-canvas_animation_hide');
        controlSubtitleBox.classList.remove('puravita-canvas_subtitle_controls_hide');
        buttonToggleShow.classList.add('is-active');
        video.dispatchEvent(subtitleConfigShow);
    };

    video.addEventListener('loadDataUrlSvg', () => {
        boxTarget.querySelector('svg').style.opacity = '1';
    });

    video.addEventListener('play', () => {
        closeSubtitle();
    });

    video.addEventListener('chromecastOnConnect', () => {
        buttonToggleShow.style.opacity = '0.4';
        buttonToggleShow.classList.add('is-blocked');
        (buttonToggleShow as HTMLButtonElement).disabled = true;
        closeSubtitle();
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        buttonToggleShow.style.opacity = '1';
        buttonToggleShow.classList.remove('is-blocked');
        (buttonToggleShow as HTMLButtonElement).disabled = false;
    });

    video.addEventListener('buttonPressPlay', () => {
        closeSubtitle();
    });

    video.addEventListener('manualTimeUpdate', () => {
        closeSubtitle();
    });

    video.addEventListener('subtitleConfigShow', () => {
        cropFrame(video, svgBlurBoxSVG, theCanvas);
    });

    video.addEventListener('showSearchSubtitle', () => {
        closeSubtitle();
    });

    buttonToggleShow.addEventListener('click', async () => {
        if (!video.paused) { video.pause(); }
        if (!buttonToggleShow.classList.contains('is-active')) {
            showSubtitle();
        } else {
            closeSubtitle();
        }
    });
};

const setInputsColor = (
    video: HTMLVideoElement,
    inputs: Array<HTMLElement>,
    subtitle: HTMLElement,
): void => {
    inputs.forEach((input) => {
        input.addEventListener('change', () => {
            subtitle.style.color = (input as HTMLInputElement).value;
            subtitle.innerText = 'Editando cores.';
        });
    });

    video.addEventListener('subtitleConfigHide', () => {
        subtitle.innerText = '';
    });
};

const setInputSizeSubtitle = (
    video: HTMLVideoElement,
    input: HTMLInputElement,
    subtitle: HTMLElement,
): void => {
    input.addEventListener('change', () => {
        subtitle.style.fontSize = `${input.value}px`;
        subtitle.innerText = 'Editando tamanho do texto.';
    });

    video.addEventListener('subtitleConfigHide', () => {
        subtitle.innerText = '';
    });
};

const commentBox = (comment: Comment, icon: HTMLElement, video: HTMLVideoElement) => {
    const item: HTMLElement = renderFunction({
        tag: 'section',
        type: 'html',
        attr: {},
        children: [],
        classes: ['puravita-chat-sidebar_messages_item'],
        id: sha256(`chat-item-${new Date().getTime()}`),
        style: {},
    });
    const itemBaloon: HTMLElement = renderFunction({
        tag: 'section',
        type: 'html',
        attr: {},
        children: [],
        classes: ['puravita-chat-sidebar_messages_item_baloon'],
        id: sha256(`chat-item-baloon-${new Date().getTime()}`),
        style: {},
    });
    const itemBaloonSpan: HTMLElement = renderFunction({
        tag: 'span',
        type: 'html',
        attr: {},
        children: [],
        classes: [],
        id: sha256(`chat-item-profile-span-${new Date().getTime()}`),
        style: {},
    });
    const itemBaloonFooter: HTMLElement = renderFunction({
        tag: 'footer',
        type: 'html',
        attr: {},
        children: [],
        classes: ['puravita-chat-sidebar_messages_item_baloon_time'],
        id: sha256(`chat-item-profile-footer-${new Date().getTime()}`),
        style: {},
    });
    const itemProfile: HTMLElement = renderFunction({
        tag: 'footer',
        type: 'html',
        attr: {},
        children: [],
        classes: ['puravita-chat-sidebar_messages_item_profile'],
        id: sha256(`chat-item-profile-${new Date().getTime()}`),
        style: {},
    });
    const itemProfileSpan: HTMLElement = renderFunction({
        tag: 'span',
        type: 'html',
        attr: {},
        children: [],
        classes: ['puravita-chat-sidebar_messages_item_name'],
        id: sha256(`chat-item-profile-span-${new Date().getTime()}`),
        style: {},
    });
    const itemProfileFigure: HTMLElement = renderFunction({
        tag: 'figure',
        type: 'html',
        attr: {},
        children: [{
            tag: 'img',
            type: 'html',
            attr: {
                src: comment.avatar,
                alt: comment.username,
            },
            children: [],
            classes: [],
            id: '',
            style: {},
        }],
        classes: ['puravita-chat-sidebar_messages_item_avatar'],
        id: sha256(`chat-item-profile-span-${new Date().getTime()}`),
        style: {},
    });
    // const buttonClose: HTMLElement = renderFunction({
    //     tag: 'button',
    //     type: 'html',
    //     attr: {},
    //     children: [{
    //         tag: 'svg',
    //         type: 'svg',
    //         attr: {
    //             width: '27',
    //             height: '27',
    //             viewBox: '0 0 27 27',
    //             fill: 'none',
    //             xmlns: 'http://www.w3.org/2000/svg',
    //         },
    //         children: [{
    //             tag: 'circle',
    //             type: 'svg',
    //             attr: {
    //                 d: 'M16.9286 10.5L10.5 16.9286',
    //                 stroke: 'white',
    //                 'stroke-width': '2',
    //                 'stroke-linecap': 'round',
    //                 'stroke-linejoin': 'round',
    //             },
    //             children: [],
    //             classes: [],
    //             id: '',
    //             style: {},
    //         }, {
    //             tag: 'path',
    //             type: 'svg',
    //             attr: {
    //                 d: 'M16.9286 10.5L10.5 16.9286',
    //                 stroke: 'white',
    //                 'stroke-width': '2',
    //                 'stroke-linecap': 'round',
    //                 'stroke-linejoin': 'round',
    //             },
    //             children: [],
    //             classes: [],
    //             id: '',
    //             style: {},
    //         }, {
    //             tag: 'path',
    //             type: 'svg',
    //             attr: {
    //                 d: 'M10.5 10.5L16.9286 16.9286',
    //                 stroke: 'white',
    //                 'stroke-width': '2',
    //                 'stroke-linecap': 'round',
    //                 'stroke-linejoin': 'round',
    //             },
    //             children: [],
    //             classes: [],
    //             id: '',
    //             style: {},
    //         }],
    //         classes: ['puravita-chat-sidebar_messages_item_close'],
    //         id: sha256(`chat-item-profile-close-${new Date().getTime()}`),
    //         style: {},
    //     }],
    //     classes: ['puravita-chat-sidebar_messages_item_button-close'],
    //     id: sha256(`chat-item-profile-button-close-${new Date().getTime()}`),
    //     style: {},
    // });

    // <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M7.92857 1.5L1.5 7.92857" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    // <path d="M1.5 1.5L7.92857 7.92857" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    // </svg>

    const buttonClose: HTMLElement = renderFunction({
        tag: 'button',
        type: 'html',
        attr: {},
        children: [{
            tag: 'svg',
            type: 'svg',
            attr: {
                width: '9',
                height: '9',
                viewBox: '0 0 9 9',
                fill: 'none',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            children: [{
                tag: 'path',
                type: 'svg',
                attr: {
                    d: 'M7.92857 1.5L1.5 7.92857',
                    stroke: 'white',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                },
                children: [],
                classes: [],
                id: '',
                style: {},
            }, {
                tag: 'path',
                type: 'svg',
                attr: {
                    d: 'M1.5 1.5L7.92857 7.92857',
                    stroke: 'white',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                },
                children: [],
                classes: [],
                id: '',
                style: {},
            }],
            classes: ['puravita-chat-sidebar_messages_item_close'],
            id: sha256(`chat-item-profile-close-${new Date().getTime()}`),
            style: {},
        }],
        classes: ['puravita-chat-sidebar_messages_item_button-close'],
        id: sha256(`chat-item-profile-button-close-${new Date().getTime()}`),
        style: {},
    });

    itemBaloonSpan.innerText = comment.comment;
    itemBaloonFooter.innerText = formatedTime(comment.time);
    itemProfileSpan.innerText = comment.username;

    itemBaloon.appendChild(itemBaloonSpan);
    itemBaloon.appendChild(itemBaloonFooter);
    itemBaloon.appendChild(buttonClose);

    itemProfile.appendChild(renderFunction(chatSvgArrowIcon));
    itemProfile.appendChild(itemProfileSpan);
    itemProfile.appendChild(itemProfileFigure);

    item.appendChild(itemBaloon);
    item.appendChild(itemProfile);
    const eventDrop = new CustomEvent('dropchat', { detail: (comment as any) });
    buttonClose.addEventListener('click', () => {
        icon.remove();
        item.remove();
        video.dispatchEvent(eventDrop);
    });

    video.addEventListener('dropchat', console.log);

    return item;
};

const addComment = (
    barbox: HTMLElement,
    chatBox: HTMLElement,
    video: HTMLElement,
    sidebarbutton: HTMLElement,
    comment: Comment,
    initialIconOpenSidebarBlock: boolean = false,
) => {
    let iconOpenSidebarBlock = initialIconOpenSidebarBlock;
    timelineIco.id = sha256(`timeline-icon-${new Date().getTime()}`);
    const percentage = (video as HTMLVideoElement).duration * 0.01;
    timelineIco.style.left = `${(comment.time / percentage).toFixed(4)}%`;
    const icon = renderFunction(timelineIco);
    const box = commentBox(comment, icon, (video as HTMLVideoElement));
    barbox.appendChild(icon);
    chatBox.appendChild(box);
    const event: MouseEvent = new MouseEvent('click');
    const eventAdd = new CustomEvent('addchat', { detail: (comment as any) });
    video.dispatchEvent(eventAdd);
    video.addEventListener('showSidebar', () => {
        iconOpenSidebarBlock = true;
    });

    video.addEventListener('hideSidebar', () => {
        iconOpenSidebarBlock = false;
    });
    icon.addEventListener('click', () => {
        if (!iconOpenSidebarBlock) {
            sidebarbutton.dispatchEvent(event);
        }
        chatBox.scrollTop = box.offsetTop;
        box.classList.add('attention');
        setTimeout(() => {
            box.classList.remove('attention');
        }, 1000);
    });
};

const saveComment = (
    barBox: HTMLElement,
    chatBox: HTMLElement,
    sidebarbutton: HTMLElement,
    chatInput: HTMLInputElement,
    chatTextarea: HTMLTextAreaElement,
    chatSubmit: HTMLButtonElement,
    video: HTMLVideoElement,
    user: Profile,
) => {
    chatSubmit.addEventListener('click', () => {
        if (!chatTextarea.value) {
            chatTextarea.classList.add('is-blocked');
            chatTextarea.focus();
        } else {
            chatTextarea.classList.remove('is-blocked');
            const newComment: Comment = {
                id: user.id,
                avatar: user.avatar,
                username: user.username,
                comment: chatTextarea.value,
                time: video.currentTime,
            };
            addComment(barBox, chatBox, video, sidebarbutton, newComment, true);
            chatTextarea.value = '';
        }
    });
};

const iniLoadingAnimation = (video: HTMLVideoElement, loading: HTMLElement) => {
    lottie.loadAnimation({
        container: loading.querySelector('figure'),
        animationData: loadingData,
        autoplay: true,
        renderer: 'svg',
    });

    video.addEventListener('videoChangeResolution', () => {
        showLoading(loading);
    });

    video.addEventListener('loadeddata', () => {
        hideLoading(loading);
    });

    video.addEventListener('canplay', () => {
        hideLoading(loading);
    });
};

const hideLoading = (loading: HTMLElement) => {
    loading.classList.add('is-block');
    setTimeout(() => {
        loading.style.zIndex = '-9';
    }, 300);
};

const showLoading = (loading: HTMLElement) => {
    loading.style.zIndex = '99';
    setTimeout(() => {
        loading.classList.remove('is-block');
    }, 300);
};

const defineDimension = (target: HTMLElement, player: HTMLElement) => {
    const { width } = target.getBoundingClientRect();
    if (width >= 1920) {
        player.classList.remove('puravita-player-screen-mobile');
        player.classList.remove('puravita-player-screen-360p');
        player.classList.remove('puravita-player-screen-480p');
        player.classList.remove('puravita-player-screen-720p');
    } else if (width >= 1280) {
        player.classList.remove('puravita-player-screen-mobile');
        player.classList.remove('puravita-player-screen-360p');
        player.classList.remove('puravita-player-screen-480p');
        player.classList.add('puravita-player-screen-720p');
    } else if (width >= 1100) {
        player.classList.remove('puravita-player-screen-mobile');
        player.classList.remove('puravita-player-screen-360p');
        player.classList.add('puravita-player-screen-480p');
        player.classList.remove('puravita-player-screen-720p');
    } else if (width >= 640) {
        player.classList.remove('puravita-player-screen-mobile');
        player.classList.add('puravita-player-screen-360p');
        player.classList.remove('puravita-player-screen-480p');
        player.classList.remove('puravita-player-screen-720p');
    } else {
        player.classList.add('puravita-player-screen-mobile');
        player.classList.remove('puravita-player-screen-360p');
        player.classList.remove('puravita-player-screen-480p');
        player.classList.remove('puravita-player-screen-720p');
    }

    window.addEventListener('resize', () => {
        defineDimension(target, player);
    });
};

const loadSubtitles = (video: HTMLVideoElement, legendLink: string) => {
    axios.get(legendLink).then((e: any) => {
        const event = new CustomEvent('loadsubtitle', { detail: parser.fromSrt(e.data, true) });
        video.dispatchEvent(event);
    });
};

const formatTextLegendToSearch = (text: string, search: string) => {
    const regExp = new RegExp(`([\\ \\w\\ \\,\\'"]){0,24}(${search})+([\\ \\w\\ \\,\\'"]){0,24}`, 'g');
    return regExp.exec(text)[0].replace(search, `<b>${search}</b>`);
};

const makeSearchResults = (video: HTMLVideoElement, { startTime, text }: any, search: string) => {
    const eventCustom = new CustomEvent('goToResultOfSearch', {
        detail: {
            startTime,
        },
    });
    const item = renderFunction({
        tag: 'section',
        type: 'html',
        id: sha256(`puravita-search-item-${new Date().getTime() * Math.random()}`),
        attr: {},
        classes: ['puravita-canvas_subtitle_controls_panel_item'],
        children: [],
        style: {},
    });
    const time = renderFunction({
        tag: 'div',
        type: 'html',
        id: sha256(`puravita-search-item-time-${new Date().getTime() * Math.random()}`),
        attr: {},
        classes: ['puravita-canvas_subtitle_controls_panel_item-time'],
        children: [],
        style: {},
    });
    const textDiv = renderFunction({
        tag: 'div',
        type: 'html',
        id: sha256(`puravita-search-item-subtitle-${new Date().getTime() * Math.random()}`),
        attr: {},
        classes: ['puravita-canvas_subtitle_controls_panel_item-subtitle'],
        children: [],
        style: {},
    });
    time.innerText = formatedTime(startTime / 1000);
    textDiv.innerHTML = `...${formatTextLegendToSearch(text.replace('\n', ' '), search).trim()}...`;
    item.addEventListener('click', () => {
        video.currentTime = startTime / 1000;
        setTimeout(() => {
            video.dispatchEvent(eventCustom);
        }, 300);
    });
    item.appendChild(time);
    item.appendChild(textDiv);
    return item;
};

const searchInput = (
    video: HTMLVideoElement,
    input: HTMLInputElement,
    svg: HTMLElement,
    theCanvas: HTMLElement,
    svgBox: HTMLElement,
    controlSearch: HTMLElement,
) => {
    video.addEventListener('loadsubtitle', ({ detail }: any) => {
        video.addEventListener('subtitleConfigShow', () => {
            input.value = '';
            showSVGCrop = false;
            controlSearch.classList.add('puravita-canvas_subtitle_search_hide');
            video.dispatchEvent(hideSearchSubtitle);
        });
        let showSVGCrop = false;
        const showCrop = () => {
            showSVGCrop = true;
            cropFrame(video, svg, theCanvas);
            svgBox.style.zIndex = '9';
            svgBox.classList.remove('puravita-canvas_animation_hide');
            controlSearch.classList.remove('puravita-canvas_subtitle_search_hide');
            video.dispatchEvent(showSearchSubtitle);
        };

        const hideCrop = () => {
            showSVGCrop = false;
            svgBox.style.zIndex = '4';
            svgBox.classList.add('puravita-canvas_animation_hide');
            controlSearch.classList.add('puravita-canvas_subtitle_search_hide');
            video.dispatchEvent(hideSearchSubtitle);
        };

        video.addEventListener('play', () => {
            input.value = '';
            hideCrop();
        });

        video.addEventListener('manualTimeUpdate', () => {
            input.value = '';
            hideCrop();
        });

        video.addEventListener('goToResultOfSearch', () => {
            input.value = '';
            hideCrop();
        });
        const header = controlSearch.querySelector('header.puravita-canvas_subtitle_controls_panel_header');
        const section = controlSearch.querySelector('section.puravita-canvas_subtitle_controls_panel_results');
        const action = () => {
            if (!video.paused) video.pause();
            if (input.value) {
                const results = detail.filter(({ text }: any) => (text.indexOf(input.value) >= 0));
                if (!showSVGCrop) {
                    showCrop();
                }
                (header as HTMLElement).innerText = `${results.length} ${(results.length == 1) ? 'resultado' : 'resultados'} encontrados para "${input.value}"`;
                section.innerHTML = '';
                results.forEach((result: any) => {
                    section.appendChild(makeSearchResults(video, result, input.value));
                });
            } else {
                hideCrop();
            }
        };
        input.addEventListener('keyup', () => {
            action();
        });
        input.addEventListener('change', () => {
            action();
        });
    });
};

const disableLabelsTrigger = (video: HTMLVideoElement, player: HTMLElement) => {
    video.addEventListener('chromecastOnConnect', () => {
        player.querySelectorAll('label').forEach((label: HTMLLabelElement) => {
            if (label.classList.contains('puravita-buttons_speed-playbackrate_button-mask')) {
                const maskSpeedParent = player.querySelector('.puravita-buttons_speed-playbackrate');
                (maskSpeedParent as HTMLElement).style.opacity = '0.4';
                (maskSpeedParent as HTMLElement).style.pointerEvents = 'none';
                (maskSpeedParent as HTMLElement).parentElement.classList.add('is-blocked');
            } else {
                label.style.opacity = '0.4';
                label.style.pointerEvents = 'none';
                label.parentElement.classList.add('is-blocked');
            }
        });
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        player.querySelectorAll('label').forEach((label: HTMLLabelElement) => {
            if (label.classList.contains('puravita-buttons_speed-playbackrate_button-mask')) {
                const maskSpeedParent = player.querySelector('.puravita-buttons_speed-playbackrate');
                (maskSpeedParent as HTMLElement).style.opacity = '1';
                (maskSpeedParent as HTMLElement).style.pointerEvents = 'initial';
                (maskSpeedParent as HTMLElement).parentElement.classList.remove('is-blocked');
            } else {
                label.style.opacity = '1';
                label.style.pointerEvents = 'initial';
                label.parentElement.classList.remove('is-blocked');
            }
        });
    });
};

const chromecast = (video: HTMLVideoElement, buttonChromecast: HTMLElement) => {
    let isConnected = false;
    let { currentTime } = video;
    let timeMonitor: any = false;

    video.addEventListener('manualTimeUpdate', () => {
        currentTime = video.currentTime;
    });

    video.addEventListener('play', () => {
        timeMonitor = setInterval(() => {
            currentTime = video.currentTime;
        });
    });

    video.addEventListener('pause', () => {
        if (timeMonitor) {
            clearInterval(timeMonitor);
            timeMonitor = false;
        }
        currentTime = video.currentTime;
    });

    cjs.on('connect', () => {
        video.dispatchEvent(chromecastOnConnect);
        buttonChromecast.classList.add('is-active');
    });

    cjs.on('playing', () => {
        if (currentTime > cjs.time) {
            cjs.seek((currentTime / (video.duration * 0.01)).toFixed(1), true);
        }

        video.dispatchEvent(chromecastOnPlay);
    });

    cjs.on('timeupdate', () => {
        if (isConnected) {
            video.currentTime = cjs.time;
            currentTime = cjs.time;
        }
    });

    cjs.on('pause', () => {
        video.currentTime = cjs.time;
        video.dispatchEvent(chromecastOnPause);
    });

    cjs.on('end', () => {
        video.dispatchEvent(chromecastOnEnd);
        setTimeout(() => {
            cjs.disconnect();
        }, 1000);
    });

    cjs.on('disconnect', () => {
        isConnected = false;
        buttonChromecast.classList.remove('is-active');
        video.dispatchEvent(chromecastOnDisconnect);
    });

    video.addEventListener('chromecastButtonPlay_PausePressPlay', () => {
        if (cjs.paused) cjs.play();
    });
    video.addEventListener('chromecastButtonPlay_PausePressPause', () => {
        if (!cjs.paused) cjs.pause();
    });

    buttonChromecast.addEventListener('click', () => {
        if (isConnected) {
            cjs.disconnect();
            isConnected = false;
            return;
        }
        if (cjs.available) {
            isConnected = true;
            video.dispatchEvent(chromecastCanPlay);
            const videoLink = 'https://mizzzael.github.io/puravita-player/assets/video/The%20Largest%20Star%20in%20the%20Universe%20???%20Size%20Comparison%20720p.mp4';
            cjs.cast(videoLink);
        } else {
            video.dispatchEvent(chromecastDontPlay);
        }
    });
};

const progressBoxManipulation = (video: HTMLVideoElement, progressBox: HTMLElement) => {
    video.addEventListener('chromecastOnConnect', () => {
        progressBox.style.opacity = '0';
        progressBox.style.pointerEvents = 'none';
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        progressBox.style.opacity = '1';
        progressBox.style.pointerEvents = 'initial';
    });
};

const initChromecastAnimation = (video: HTMLVideoElement, animationTarget: HTMLElement) => {
    const animationChromecast = lottie.loadAnimation({
        container: animationTarget,
        animationData: chromecastAnimation,
        autoplay: false,
        renderer: 'svg',
    });

    video.addEventListener('chromecastOnConnect', () => {
        animationTarget.classList.add('puravita-chromecast-animation_show');
        animationChromecast.play();
    });

    video.addEventListener('chromecastOnDisconnect', () => {
        animationTarget.classList.remove('puravita-chromecast-animation_show');
        animationChromecast.pause();
    });
};

const setResolution = (
    video: HTMLVideoElement,
    list: HTMLElement,
    listResolutions: Map<string, string>,
    resolutionLabel: HTMLElement,
) => {
    list.querySelectorAll('label').forEach((label) => {
        label.addEventListener('click', (e: any) => {
            if (!video.paused) video.pause();
            list.querySelectorAll('label').forEach((lb: any) => {
                lb.classList.remove('is-active');
            });
            const nowMomentOfVideo = video.currentTime;
            const videoURL = e.target.getAttribute('data-value');
            resolutionLabel.innerText = `Qualidade ${e.target.innerText}`;
            video.querySelector('source').src = `${listResolutions.get(videoURL)}`;
            video.load();
            label.classList.add('is-active');
            video.currentTime = nowMomentOfVideo;
            video.dispatchEvent(videoChangeResolution);
        });
    });
};

export {
    playPause,
    progress,
    setProgressPercentage,
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
};
