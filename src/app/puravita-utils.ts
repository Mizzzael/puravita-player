import { gsap } from 'gsap';

const inputClose = (input: HTMLInputElement | any, inputs: NodeListOf<Element>) => {
    inputs.forEach((v) => {
        if (v != input) {
            (v as any).checked = false;
        }
    });
};

const controlInputsToggle = (player: HTMLElement) => {
    const inputs = player.querySelectorAll('input[type="checkbox"]');
    const labels = player.querySelectorAll('label');
    document.addEventListener('click', () => {
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
};

const playPause = (video: any, button: HTMLElement): void => {
    video.addEventListener('pause', () => {
        video.classList.remove('puravita-play');
    });

    video.addEventListener('ended', () => {
        video.classList.remove('puravita-play');
    });

    video.addEventListener('play', () => {
        video.classList.add('puravita-play');
    });
    button.addEventListener('click', (): void => {
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

const countTime = (time: HTMLElement, currentTime: any, durationTime: any): void => {
    if (!durationTime) return;
    const timenumber: number = durationTime - currentTime;
    const sec_num: number = parseInt(timenumber.toString(), 10);
    let hours: string | number = Math.floor(sec_num / 3600);
    let minutes: string | number = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: string | number = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = `0${hours}`; }
    if (minutes < 10) { minutes = `0${minutes}`; }
    if (seconds < 10) { seconds = `0${seconds}`; }

    time.innerText = `${hours}:${minutes}:${seconds}`;
};

const canPlay = (video: HTMLVideoElement, callback = () => {}): void => {
    video.addEventListener('canplay', () => {
        callback();
    });
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

const sidebarToggle = (video: HTMLVideoElement, button: HTMLElement, sidebar: HTMLElement, controller: HTMLElement): void => {
    let isShow: boolean = false;
    button.addEventListener('click', () => {
        if (isShow) {
            isShow = false;
            sidebar.classList.remove('puravita-chat-sidebar-show');
            controller.classList.remove('puravita-controller-sidebar');
        } else {
            isShow = true;
            video.pause();
            sidebar.classList.add('puravita-chat-sidebar-show');
            controller.classList.add('puravita-controller-sidebar');
        }
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
    });
};

const blurSvgShow = (video: HTMLVideoElement, svg: HTMLElement, theCanvas: any) => {
    const cropFrame = () => {
        theCanvas.width = video.getClientRects()[0].width;
        theCanvas.height = video.getClientRects()[0].height;
        const ctx = theCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, theCanvas.width, theCanvas.height);
        const image = svg.querySelector('image');
        image.setAttribute('xlink:href', theCanvas.toDataURL());
    };
    video.addEventListener('pause', () => {
        cropFrame();
    });
    video.addEventListener('play', () => {
        cropFrame();
    });
    cropFrame();
};

const showSubtitleConfig = (video: HTMLVideoElement, buttonToggleShow: HTMLElement, boxTarget: HTMLElement) => {
    buttonToggleShow.addEventListener('click', () => {
        video.pause();
        if (buttonToggleShow.classList.contains('is-active')) {
            buttonToggleShow.classList.remove('is-active');
            // boxTarget.style.visibility = 'hidden';
            boxTarget.style.zIndex = '4';
            boxTarget.classList.add('puravita-canvas_animation_hide');
        } else {
            buttonToggleShow.classList.add('is-active');
            boxTarget.style.zIndex = '9';
            boxTarget.classList.remove('puravita-canvas_animation_hide');
        }
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
    blurSvgShow,
    showSubtitleConfig,
};
