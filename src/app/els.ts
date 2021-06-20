import { tagHTML } from './puravita-render';

const timelineIcoSVGPath: tagHTML = {
    tag: 'path',
    type: 'svg',
    classes: [],
    attr: {
        d: 'M14 16L10 12.9444L6 16V6.22222C6 5.89807 6.12041 5.58719 6.33474 5.35798C6.54906 5.12877 6.83975 5 7.14286 5H12.8571C13.1602 5 13.4509 5.12877 13.6653 5.35798C13.8796 5.58719 14 5.89807 14 6.22222V16Z',
        stroke: 'black',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    },
    children: [],
    style: {},
    id: '',
};

const timelineIcoSVGCircle: tagHTML = {
    tag: 'circle',
    type: 'svg',
    classes: [],
    attr: {
        cx: '10',
        cy: '10',
        r: '10',
        fill: 'white',
    },
    children: [],
    style: [],
    id: '',
};

const timelineIcoSVG: tagHTML = {
    tag: 'svg',
    type: 'svg',
    classes: [],
    attr: {
        width: '20',
        height: '20',
        viewBox: '0 0 20 20',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
    },
    children: [timelineIcoSVGCircle, timelineIcoSVGPath],
    style: [],
    id: '',
};

const timelineIco: tagHTML = {
    tag: 'div',
    type: 'html',
    classes: ['puravita-progressbar_markup-timeline'],
    attr: {},
    children: [timelineIcoSVG],
    style: {},
    id: '',
};

const chatSvgArrowIconPath: tagHTML = {
    tag: 'path',
    type: 'svg',
    classes: [],
    attr: {
        d: 'M2.88878 0H25.0003C26.1049 0 27.0003 0.89543 27.0003 2V23.7303C27.0003 25.5038 24.8633 26.3998 23.5985 25.1568L1.48692 3.42646C0.210092 2.17164 1.09858 0 2.88878 0Z',
        fill: 'white',
    },
    id: '',
    children: [],
    style: {},
};

const chatSvgArrowIcon: tagHTML = {
    tag: 'svg',
    type: 'svg',
    classes: ['puravita-chat-sidebar_messages_item_profile_arrow'],
    attr: {
        width: '27',
        height: '26',
        viewBox: '0 0 27 26',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
    },
    id: '',
    children: [chatSvgArrowIconPath],
    style: {},
};

export {
    timelineIco,
    chatSvgArrowIcon,
};

// <section class="puravita-chat-sidebar_messages_item">
//     <div class="puravita-chat-sidebar_messages_item_baloon">
//         <span>
//             Importante:
//             Lorem ipsum dolor sit amet consectetur.
//         </span>
//         <footer class="puravita-chat-sidebar_messages_item_baloon_time">
//             08:31
//         </footer>
//     </div>
//     <footer class="puravita-chat-sidebar_messages_item_profile">
//         <svg class="puravita-chat-sidebar_messages_item_profile_arrow" width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M2.88878 0H25.0003C26.1049 0 27.0003 0.89543 27.0003 2V23.7303C27.0003 25.5038 24.8633 26.3998 23.5985 25.1568L1.48692 3.42646C0.210092 2.17164 1.09858 0 2.88878 0Z" fill="white"/>
//         </svg>
//         <span class="puravita-chat-sidebar_messages_item_name">
//             cutesexyrobutts
//         </span>
//         <figure class="puravita-chat-sidebar_messages_item_avatar">
//             <img src="../../assets/images//avatar/1.webp" alt="">
//         </figure>
//     </footer>
// </section>
