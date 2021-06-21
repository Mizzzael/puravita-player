import { sha256 } from 'js-sha256';
import lottie from 'lottie-web';
import axios from 'axios';
import { timelineIco, chatSvgArrowIcon } from './els';
import { renderFunction } from './puravita-render';

const parser = require('subtitles-parser');
const loadingData = require('./loading.json');

const loadDataUrlSvg: Event = new Event('loadDataUrlSvg');
const subtitleConfigShow: Event = new Event('subtitleConfigShow');
const subtitleConfigHide: Event = new Event('subtitleConfigHide');
const buttonPressPlay: Event = new Event('buttonPressPlay');
const manualTimeUpdate: Event = new Event('manualTimeUpdate');
const showSidebar: Event = new Event('showSidebar');
const hideSidebar: Event = new Event('hideSidebar');

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

    video.addEventListener('subtitleConfigShow', () => {
        waitClose = true;
    });

    video.addEventListener('subtitleConfigHide', () => {
        waitClose = false;
    });

    button.addEventListener('click', (): void => {
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

const progress = (video: HTMLVideoElement | any, progressbar: HTMLElement, time: HTMLElement): void => {
    let timeInterval: any | boolean = false;
    video.addEventListener('play', (): void => {
        timeInterval = setInterval(() => {
            setProgressPercentage(progressbar, video, video.currentTime);
            countTime(time, video.currentTime, video.duration);
        });
    });

    video.addEventListener('pause', (): void => {
        if (timeInterval) {
            clearInterval(timeInterval);
            timeInterval = false;
        }
    });

    video.addEventListener('ended', (): void => {
        if (timeInterval) {
            clearInterval(timeInterval);
            timeInterval = false;
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
        const onPlay = () => {
            const currentTime = (video.currentTime * 1000).toFixed(0);
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
            } else if (subtitleOBJ && subtitleOBJ.endTime <= currentTime) {
                subtitleOBJ = false;
                subtitle.innerText = '';
            }
        };
        video.addEventListener('play', () => {
            time = setInterval(onPlay, 300);
        });

        video.addEventListener('pause', () => {
            if (time) {
                clearInterval(time);
                time = false;
            }
        });

        video.addEventListener('ended', () => {
            if (time) {
                clearInterval(time);
                time = false;
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

const sidebarToggle = (video: HTMLVideoElement, button: HTMLElement, playButton: HTMLButtonElement, sidebar: HTMLElement, controller: HTMLElement, chatTagTextarea: HTMLInputElement, chatInput: HTMLInputElement): void => {
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
        video.currentTime = minuteSet;
        countTime(time, video.currentTime, duration);
        video.dispatchEvent(manualTimeUpdate);
    });
};

let ctx: any = false;
let imageGamb: any = false;
const cropFrame = (video: HTMLVideoElement, svg: HTMLElement, theCanvas: any) => {
    if (!ctx) {
        imageGamb = svg.querySelector('image');
        theCanvas.width = video.getClientRects()[0].width;
        theCanvas.height = video.getClientRects()[0].height;
        ctx = theCanvas.getContext('2d');
    }
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

    video.addEventListener('buttonPressPlay', () => {
        closeSubtitle();
    });

    video.addEventListener('manualTimeUpdate', () => {
        closeSubtitle();
    });

    video.addEventListener('subtitleConfigShow', () => {
        cropFrame(video, svgBlurBoxSVG, theCanvas);
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

const setInputsColor = (inputs: Array<HTMLElement>, subtitle: HTMLElement): void => {
    inputs.forEach((input) => {
        input.addEventListener('change', () => {
            subtitle.style.color = (input as HTMLInputElement).value;
        });
    });
};

const setInputSizeSubtitle = (input: HTMLInputElement, subtitle: HTMLElement): void => {
    input.addEventListener('change', () => {
        subtitle.style.fontSize = `${input.value}px`;
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
    const buttonClose: HTMLElement = renderFunction({
        tag: 'button',
        type: 'html',
        attr: {},
        children: [{
            tag: 'svg',
            type: 'svg',
            attr: {
                width: '27',
                height: '27',
                viewBox: '0 0 27 27',
                fill: 'none',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            children: [{
                tag: 'circle',
                type: 'svg',
                attr: {
                    d: 'M16.9286 10.5L10.5 16.9286',
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
                    d: 'M16.9286 10.5L10.5 16.9286',
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
                    d: 'M10.5 10.5L16.9286 16.9286',
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

const addComment = (barbox: HTMLElement, chatBox: HTMLElement, video: HTMLElement, sidebarbutton: HTMLElement, comment: Comment, initialIconOpenSidebarBlock: boolean = false) => {
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

const saveComment = (barBox: HTMLElement, chatBox: HTMLElement, sidebarbutton: HTMLElement, chatInput: HTMLInputElement, chatTextarea: HTMLTextAreaElement, chatSubmit: HTMLButtonElement, video: HTMLVideoElement, user: Profile) => {
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

const iniLoadingAnimation = (loading: HTMLElement) => {
    lottie.loadAnimation({
        container: loading.querySelector('figure'),
        animationData: loadingData,
        autoplay: true,
        renderer: 'svg',
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
};
