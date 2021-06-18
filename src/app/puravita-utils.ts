const inputClose = (input: HTMLInputElement | any, inputs: NodeListOf<Element>) => {
    inputs.forEach((v) => {
        if (v != input) {
            (v as any).checked = false;
        }
    });
};

const controlInputsToggle = (player: HTMLElement) => {
    const inputs = player.querySelectorAll('input[type="checkbox"]:not(.js-inative)');
    document.addEventListener('click', () => {
        inputs.forEach((v) => {
            (v as any).checked = false;
        });
    });
    inputs.forEach((input) => {
        input.addEventListener('click', (e) => {
            e.cancelBubble = true;
            e.stopPropagation();
            if ((input as any).checked) {
                inputClose(input, inputs);
            }
        });
    });
};

const playPause = (video: any, button: HTMLElement): void => {
    button.addEventListener('click', (): void => {
        if (video.classList.contains('puravita-play')) {
            video.pause();
            video.classList.remove('puravita-play');
        } else {
            video.play();
            video.classList.add('puravita-play');
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
};
