var colIndex = 1
var cols = ["black", "#bf501f", "#f59c34", "#89a7c6", "#7bc597", "#8d639a", "#8d639a", "#e4a774", "#828687", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick"]

const getTagColor = tag => {
    return cols[tag.colorIndex]
}


var partOfSpeechMode = false
var startIndex
var endIndex

var highlight = () => {
    let startIndex_ = startIndex < endIndex ? startIndex : endIndex
    let endIndex_ = startIndex > endIndex ? startIndex : endIndex

    let selected = words.filter(wordInfo => wordInfo.index >= startIndex_ && wordInfo.index <= endIndex_)


    words.forEach(wordInfo => {
        wordInfo.selecting = false
        wordInfo.dom.classList.remove('selected')
        wordInfo.dom.firstChild.setAttribute('style', '')
    })

    selected.forEach((wordInfo, ind) => {
        wordInfo.selecting = true
        wordInfo.dom.classList.add('selected')

        if (ind == 0) {
            wordInfo.dom.firstChild.setAttribute('style', 'border-bottom-left-radius: 5px; border-top-left-radius: 5px;')
        }
        if (ind == selected.length - 1) {
            wordInfo.dom.firstChild.setAttribute('style', wordInfo.dom.firstChild.getAttribute('style') + ' border-bottom-right-radius: 5px; border-top-right-radius: 5px;')
        }
    })

    partOfSpeechMode = selected.length > 0

    if (active_menu == 'relation') return
    if (selected.length == 0) setMenu('nothing-selected')
    if (selected.length > 0 & selected.length < 3) setMenu('named-entity')
    if (selected.length > 3) setMenu('topic')
    // draw();
}


var onmousedown_ = (e) => {
    if (e.touches && e.touches.length === 2) {
        dehighlight_();
        return
    }
    // if (!cntrlIsPressed) 
    // words.forEach(wordInfo => wordInfo.selecting = false)
    startSelection = true
    startIndex = parseInt(e.currentTarget.getAttribute('index'))
    endIndex = startIndex
    // let targetIndex = parseInt(e.currentTarget.getAttribute('index'))
    // let theWord = words.find(wordInfo => wordInfo.index == targetIndex)
    // startToken = theWord
    // theWord.selecting = true
    highlight()
    // e.preventDefault()
}
var ontouchmove_ = (e) => {
    if (e.touches && e.touches.length === 2) {s
        dehighlight_();
        return
    }
    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    var touch = evt.touches[0] || evt.changedTouches[0];
    el = document.elementFromPoint(touch.pageX, touch.pageY)

    currentTarget = el.getAttribute("index") ? el : el.parentElement
    onmouseenter_(e, currentTarget)
}

var onmouseenter_ = (e, currentTarget) => {
    if (e.touches && e.touches.length === 2) {
        dehighlight_();
        return
    }
    if (!startSelection) return
    currentTarget = currentTarget || e.currentTarget
    endIndex = parseInt(currentTarget.getAttribute('index'))
    // let targetIndex = parseInt(currentTarget.getAttribute('index'))
    // let theWord = words.find(wordInfo => wordInfo.index == targetIndex)
    // let nextWord = words.find(wordInfo => wordInfo.index == targetIndex + 1)
    // let prevtWord = words.find(wordInfo => wordInfo.index == targetIndex - 1)

    // if ((nextWord && nextWord.selecting) || (prevtWord && prevtWord.selecting)) theWord.selecting = true
    highlight()
    // e.preventDefault()
}

var onmouseup_ = (e) => {
    startSelection = false
    // e.preventDefault()
}
var parrentCont = document.querySelector('div.sent')
var cont = document.querySelector('div.sent .scrolling')

const dehightlight = (e) => {
    if (e.target.tagName == 'CANVAS' || e.target.className == 'sent') {
        dehightlight_()
    }
}

const dehightlight_ = () => {
    startIndex = -1
    endIndex = -1

    highlight()
}

var cntrlIsPressed = false;

document.body.addEventListener('keydown', (e) => { if (17 == e.which) cntrlIsPressed = true });

document.body.addEventListener('keyup', (e) => cntrlIsPressed = false);

var startSelection = false
var tags = []
var tagId = tags.length
var max_layers

cont.ontouchstart = (event) => {
    if (event.touches.length === 2) {
        dehightlight_()
        event.preventDefault()
        lastTouchY = event.touches[0].clientY;
    }
}

cont.ontouchmove = (event) => {
    if (event.touches.length === 2) {
        dehightlight_()
        event.preventDefault()

        const delta = lastTouchY - event.touches[0].clientY;
        lastTouchY = event.touches[0].clientY;

        parrentCont.scrollTop += delta;
    }
}

const display_sent = (text) => {
    startSelection = false

    
    let ndoesToRemove = [...cont.childNodes].filter(el => el.tagName !== 'CANVAS')
    ndoesToRemove.forEach(el => el.remove())

    words = text.split(' ').map(a => a.trim()).map(t => ({ text: t }))


    words.forEach((wordInfo, wordIndex) => {
        span = document.createElement('span')
        span.setAttribute('index', wordIndex)
        span.setAttribute('draggable', false)

        span.className = 'word'
        span.innerHTML = '<span>' + wordInfo.text + '</span>'
        cont.appendChild(span)

        span.onmousedown = onmousedown_
        span.onmouseenter = onmouseenter

        span.addEventListener("pointerenter", onmouseenter_)


        span.addEventListener("touchstart", onmousedown_)
        span.addEventListener("touchmove", ontouchmove_)

        span.onmouseup = onmouseup_
        span.ontouchcancel = onmouseup_
        span.ontouchend = onmouseup_

        wordInfo.dom = span
        wordInfo.index = wordIndex
        wordInfo.borders = []
        wordInfo.selecting = false

    })


    tags = []
    tagId = tags.length
}
let relations = []

var orderTagsAndDrowUnderlines = () => {
    let allTaggedWords = [].concat.apply([], tags.map(tag => tag.words))

    countOfWords = allTaggedWords.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    let countOfWordsSorted = Array.from(countOfWords, ([name, value]) => ({ name, value }))
    max_layers = countOfWordsSorted.length ? countOfWordsSorted.sort((a, b) => b.value - a.value)[0].value : 0
    
    
    words.forEach(wordInfo => {
        wordInfo.occupiedLayers = []
        let wordSpanBorderStyle = wordInfo.dom.firstChild.getAttribute('style')
        wordInfo.dom.innerHTML = `<span ${wordSpanBorderStyle ? 'style="' + wordSpanBorderStyle + '" ' : ''}>${wordInfo.text}</span>`
        for (let layer_index = 0; layer_index < max_layers; layer_index++) {
            let span = document.createElement('span')
            wordInfo.dom.appendChild(span)
        }
    })
    let startTagForLine
    relations = []
    tags.forEach((tag, index) => {
        
        let tagWords = tag.words.map(wordIndex => words.find(word => word.index == wordIndex))
        let avaliableLayer
        let isAvaliable
        for (avaliableLayer = 1; avaliableLayer <= max_layers; avaliableLayer++) {
            isAvaliable = tagWords.reduce((isAvaliable, wordInfo) => {
                if (!isAvaliable) return isAvaliable
                return wordInfo.occupiedLayers.indexOf(avaliableLayer) === -1
            }, !0)
            if (isAvaliable) break
        }

        tagWords.forEach((wordInfo, wordInd) => {
            if (!isAvaliable) {
                let span = document.createElement('span')
                wordInfo.dom.appendChild(span)
                avaliableLayer++
            }
            let wordSpan = wordInfo.dom.querySelector('span:nth-child(1)')
            let colorForTag = getTagColor(tag)
            span = wordInfo.dom.querySelector('span:nth-child(' + (avaliableLayer + 1) + ')')
            span.style.borderBottom = '3px solid ' + colorForTag
            span.style.background = colorForTag
            
            if (wordInd == 0) {
                if(tag.relation == 'start'){
                    startTagForLine = span
                }
                if(tag.relation == 'end'){
                    relations.push([startTagForLine, span, colorForTag])
                }
                
                span.classList.add('start-point')
                span.innerHTML = '<i style="">' + tag.label + '</i>'
            }
            if (wordInd == tagWords.length - 1) {
                span.classList.add('end-point')
            } 
            wordInfo.occupiedLayers.push(avaliableLayer)
        })
    })
    hideemptylines()
    drawRelations()
    return
}

var lines

var hideemptylines = () => {
    // cont = document.querySelector('div.sent')
    let contWidth
    var style = window.getComputedStyle(cont, null);
    contWidth = style.getPropertyValue("width");
    contWidth = Number(contWidth.replace('px', ''))

    contWidth = cont.offsetWidth
    lines = [[]]
    offset = 0
    words.forEach(wordInfo => {
        if(lines.length == 2){
            // console.log(offset, wordInfo.dom.offsetWidth , contWidth)
        }
        if (offset + wordInfo.dom.offsetWidth < contWidth - 20) {//subtract padding
            lines[lines.length - 1].push(wordInfo)
            offset += wordInfo.dom.offsetWidth
        } else {
            lines.push([wordInfo])
            offset = wordInfo.dom.offsetWidth
        }
    })
    lines.forEach(line => {
        for (let layer_index = max_layers; layer_index > 0; layer_index--) {
            let spans_in_a_line = line.map(wordInfo => wordInfo.dom.querySelectorAll('span')[layer_index])
            
            let no_of_underlines = spans_in_a_line.map(a => !a.className && !a.getAttribute('style')).every(Boolean)
            if (no_of_underlines) {
                spans_in_a_line.forEach(sp => sp.className = 'hide')
            } 
        }

    })
}

const saveAndNext = async () => {
    if (cur_sent + 1 >= sentences.length) return
    active_menu = 'nothing-selected'
    cur_sent++
    display_sent(sentences[cur_sent].text)
    //TEMP:
    // let tx = document.querySelectorAll('.header span')[1].innerText.split('-')[1]
    // document.querySelectorAll('.header span')[1].innerText = tx + 1


    // let tagsPostData = { tags: tags.map(tag => ({ words: tag.words, label: tag.label })) }
    // var data = new FormData();
    // data.append( "json", JSON.stringify( tagsPostData ) );

    // fetch(API + 'save_and_next',
    //     {
    //         method: "POST",
    //         body: data
    //     })
    //     .then(res => res.json())
    //     .then(display_sent)

}

var saveTag = (label) => {
    selectedIndexes = words.filter(wordInfo => wordInfo.selecting).map(wordInfo => wordInfo.index)
    
    let dublicateTag
    let dublicateTagIndex
    tags.forEach((tagInfo, tagIndex) => {
        if(tagInfo.label == label && tagInfo.words.join('') == selectedIndexes.join('')){
            dublicateTagIndex = tagIndex
            dublicateTag = tagInfo
        }
    })
    if (dublicateTag){
        tags.splice(dublicateTagIndex, 1);
        colIndex = colIndex - 1 > 0 ? colIndex - 1 : cols.length - 1
        
        if(active_menu == 'relation'){
            if(!tags.length){
                setMenu('relation')
            } else if (tags.length && !(tags[tags.length - 1].labelGroup == 'relation' && tags[tags.length - 1].relation != 'start')){
                setMenu('relation')    

            }
        }
    }

    if (selectedIndexes.length !== 0 && !dublicateTag) {
        colIndex = colIndex + 1 < cols.length ? colIndex+1 : 1  
        let ralation_ = null
        if(active_menu == 'relation'){
            if(!tags.length ||  tags[tags.length - 1].relation !== 'start'){
                ralation_ = 'start'
                setMenu('relation', label)

            } else {
                setMenu('relation')
                ralation_ = 'end'
                colIndex = colIndex - 1 > 0 ? colIndex - 1 : cols.length - 1
            }
        }

        tags.push({ id: tagId, label: label, colorIndex: colIndex, words: selectedIndexes, relation: ralation_, labelGrup: active_menu }) 
    }

    tags.forEach(tag => tag.drown = false)
    // words.forEach(wordInfo => {
    //     wordInfo.selecting = false
    //     wordInfo.borders = []
    // })

    // dehightlight({target:{className: 'sent'}})
    orderTagsAndDrowUnderlines()

    
    tagId++
}


const drawRelations = () => {
    canvas.setAttribute('width', canvas.offsetWidth);
    canvas.setAttribute('height', canvas.offsetHeight);
    relations.forEach(rel => drawRelation(rel[0], rel[1], rel[2]))
}


var sentences = [
    { id: 1, text: `Conservative and opposition MPs are demanding answers from Boris Johnson over claims he attended a drinks event in the No 10 garden during lockdown. Labour's deputy leader Angela Rayner said that if he was there, and he lied about it, his position is "untenable". While Liberal Democrat leader Sir Ed Davey said the PM should resign now. Mr Johnson will appear at Prime Minister's Questions later - his first public appearance since details of the May 2020 event emerged. The prime minister has so far declined to say whether he attended the gathering, but witnesses have told the BBC both he and his wife were among 30 people at the drinks held on the 20 May 2020. The BBC has been told that Mr Johnson will not make a separate statement on parties in the House of Commons but a senior government source didn't rule out him making some remarks at the start of Prime Minister's Questions.` },
    { id: 1, text: "სამხრეთ აფრიკის პარლამენტში ხანძარი გაჩნდა. ცეცხლი შენობის სახურავიდან ამოდიოდა და კვამლი კილომეტრების მოშორებით ჩანდა. ინფორმაციას Reuters ავრცელებს. ინფრასტრუქტურის მინისტრმა პატრიცია დე ლილემ ჟურნალისტებს განუცხადა, რომ ხანძარი ლოკალიზებულია. მისი თქმით, დამწვარია ეროვნული ასამბლეის დარბაზი და ხანძარი მოედო სხვა ტერიტორიასაც. პირველადი ინფორმაციით, ხანძარი ერთ-ერთ ოფისში გაჩნდა და სპორტული დარბაზისკენ გავრცელდა. დე ლილის თქმით, ხანძრის შედეგად დაშავებულების შესახებ ინფორმაცია არ ვრცელდება. ხელისუფლების განცხადებით, მეხანძრეები სიტუაციას აკონტროლებენ. ხანძრის გამომწვევი მიზეზი ჯერჯერობით უცნობია. სამხრეთ აფრიკის პარლამენტში ხანძარი გაჩნდა. ცეცხლი შენობის სახურავიდან ამოდიოდა და კვამლი კილომეტრების მოშორებით ჩანდა. ინფორმაციას Reuters ავრცელებს. ინფრასტრუქტურის მინისტრმა პატრიცია დე ლილემ ჟურნალისტებს განუცხადა, რომ ხანძარი ლოკალიზებულია. მისი თქმით, დამწვარია ეროვნული ასამბლეის დარბაზი და ხანძარი მოედო სხვა ტერიტორიასაც. პირველადი ინფორმაციით, ხანძარი ერთ-ერთ ოფისში გაჩნდა და სპორტული დარბაზისკენ გავრცელდა. დე ლილის თქმით, ხანძრის შედეგად დაშავებულების შესახებ ინფორმაცია არ ვრცელდება. ხელისუფლების განცხადებით, მეხანძრეები სიტუაციას აკონტროლებენ. ხანძრის გამომწვევი მიზეზი ჯერჯერობით უცნობია." },
    { id: 1, text: "ინტენსიური თოვის და დაბალი ტემპერატურის გამო, შიდასახელმწიფოებრივი მნიშვნელობის გომი-საჩხერე-ჭიათურა-ზესტაფონის საავტომობილო გზის კმ18-კმ40 მონაკვეთზე, აკრძალულია მისაბმელიანი და ნახევრადმისაბმელიანი ავტოტრანსპორტის მოძრაობა, ხოლო დანარჩენი სახის ავტოტრანსპორტის მოძრაობა თავისუფალია. საავტომობილო გზების დეპარტამენტის ინფორმაციით, გზის დანარჩენ მონაკვეთზე ავტოტრანსპორტის მოძრაობა თავისუფალია." },
    { id: 1, text: "When you need to annotate a word or a phrase, you'll use Tags to say what the annotation is. Examples of tags are Person, Location, Object, Noun etc. You can use any tags in any language. When you need to annotate a word or a phrase, you'll use Tags to say what the annotation is. Examples of tags are Person, Location, Object, Noun etc. You can use any tags in any language." }
]

const disableNextAndPrev = () => {
    let curentMenuIndex = labels.map(l => l.name).indexOf(active_menu)
    if(active_menu == 'nothing-selected'){
        nextBtn.removeEventListener("click", next)
        nextBtn.classList.add('disabled')
    
        nextBtn.removeEventListener("click", next)
        nextBtn.classList.add('disabled')
        console.log('removing')
        return
    }
    if (curentMenuIndex + 1 >= labels.length){
        nextBtn.removeEventListener("click", next)
        nextBtn.classList.add('disabled')
    } else {
        nextBtn.addEventListener("click", next)
        nextBtn.classList.remove('disabled')
    }

    if (curentMenuIndex - 1 <= 0){
        prevBtn.removeEventListener("click", prev)
        prevBtn.classList.add('disabled')
    } else {
        prevBtn.addEventListener("click", prev)
        prevBtn.classList.remove('disabled')
    }
}

var next = () => {
    let menuLabels = labels.map(l => l.name)
    let curentMenuIndex = menuLabels.indexOf(active_menu)

    if (curentMenuIndex + 1 < all_menus.length) {
        active_menu = menuLabels[curentMenuIndex + 1]
        setMenu(active_menu)
    }
    
    disableNextAndPrev()

    all_menus.forEach(menu => menu.setAttribute('class', menu.getAttribute('ind') == active_menu ? 'show' : ''))

    // if()
}

var prev = () => {
    let menuLabels = labels.map(l => l.name)
    let curentMenuIndex = menuLabels.indexOf(active_menu)

    if (curentMenuIndex - 1 >= 1) {
        active_menu = menuLabels[curentMenuIndex - 1]
        setMenu(active_menu)
    }
    disableNextAndPrev()
    
    
    all_menus.forEach(menu => menu.setAttribute('class', menu.getAttribute('ind') == active_menu ? 'show' : ''))
}

const selectAll = () => {
    words.forEach(wordInfo => {
        wordInfo.selecting = true
    })
    startIndex = 0
    endIndex = words.length - 1
    highlight()
    // hideemptylines()
}

const nextBtn = document.querySelector('.next')
const prevBtn = document.querySelector('.prev')
// nextBtn.addEventListener("click", next)
// prevBtn.addEventListener("click", prev)

const setMenu = (menuName, label) => {
    active_menu = menuName
    
    all_menus.forEach(menu => menu.setAttribute('class', menu.getAttribute('ind') == menuName ? 'show' : ''))
    document.querySelector('.label-title').innerText = menuName.replace('-', ' ')
    
    if(label) {
        all_menus
            .find(menu => menu.getAttribute('ind') == menuName)
            .querySelectorAll('span')
            .forEach(span => span.setAttribute('class', span.innerText == label ? '' : 'hide'))

        // nextBtn.removeEventListener("click", next)
        // nextBtn.classList.add('disabled')
        // prevBtn.removeEventListener("click", prev)
        // prevBtn.classList.add('disabled')

    } else if (menuName == 'nothing-selected'){
        // nextBtn.removeEventListener("click", next)
        // nextBtn.classList.add('disabled')
        // prevBtn.removeEventListener("click", prev)
        // prevBtn.classList.add('disabled')
    } else {
        all_menus
            .find(menu => menu.getAttribute('ind') == menuName)
            .querySelectorAll('span')
            .forEach(span => span.setAttribute('class', ''))
        
        // nextBtn.addEventListener("click", next)
        // nextBtn.classList.remove('disabled')
        // prevBtn.addEventListener("click", prev)
        // prevBtn.classList.remove('disabled')
    }
    disableNextAndPrev()


}


const labels = [
    {
        name: 'nothing-selected',
        values: [
            { id: 1, text: "Select all" , value: "Select all" },
        ]
    },
    {
        name: 'topic',
        values: [
            { id: 1, text: "Anti west" , value: "Anti west" },
            { id: 2, text: "Pro-kremlian" , value: "Pro-kremlian" },
            { id: 3, text: "Hate speech" , value: "Hate speech" },
            { id: 1, text: "Border" , value: "Border" },
            { id: 2, text: "Prisoners" , value: "Prisoners" },
            { id: 3, text: "Military" , value: "Military" },
            { id: 3, text: "Anti LGBTQ" , value: "Anti LGBTQ" },
            { id: 3, text: "Terorism" , value: "Terorism" },
            { id: 3, text: "Gender" , value: "Gender" },
        ]
    },
    {
        name: 'named-entity',
        values: [
        // { id: 6, text: "CARDINAL" , value: "CARDINAL" },
            { id: 6, text: "Date" , value: "Date" },
            { id: 6, text: "Event" , value: "Event" },
            { id: 6, text: "Fac" , value: "Fac" },
            { id: 6, text: "Gpe" , value: "Gpe" },
            { id: 6, text: "Language" , value: "Language" },
            { id: 6, text: "Law" , value: "Law" },
            { id: 6, text: "Loc" , value: "Loc" },
            { id: 6, text: "money" , value: "money" },
            // { id: 6, text: "NORP" , value: "NORP" },
            // { id: 6, text: "ORDINAL" , value: "ORDINAL" },
            { id: 6, text: "Org" , value: "Org" },
            // { id: 6, text: "PERCENT" , value: "PERCENT" },
            { id: 6, text: "Person" , value: "Person" },
            { id: 6, text: "Product" , value: "Product" },
            { id: 6, text: "Quantity" , value: "Quantity" },
            { id: 6, text: "Time" , value: "Time" },
// { id: 6, text: "WORK_OF_ART" , value: "WORK_OF_ART" },
            // { id: 6, text: "Person" , value: "Person" },
            // { id: 7, text: "Organization" , value: "Organization" },
            // { id: 8, text: "Event" , value: "Event" },
            // { id: 9, text: "Location" , value: "Location" },
            { id: 10, text: "Target" , value: "Target" },
            // { id: 6, text: "Person" , value: "Person" },
            // { id: 7, text: "Organization" , value: "Organization" },
            // { id: 8, text: "Event" , value: "Event" },
            // { id: 9, text: "Location" , value: "Location" },
            // { id: 10, text: "Hate speech target" , value: "Hate speech target" },
        ]
    },
    {
        name: 'sentiment',
        values: [
            // { id: 1, text: "Negative" , value: "Negative" },
            // { id: 2, text: "Mostly negative" , value: "Mostly negative" },
            // { id: 3, text: "Neutral" , value: "Neutral" },
            // { id: 2, text: "Mostly positive" , value: "Mostly positive" },
            // { id: 3, text: "Positive" , value: "Positive" },
            { id: 1, text: '<i class="far fa-angry"></i>' , value: 'Negative' },
            { id: 2, text: '<i class="far fa-frown"></i>' , value: 'Mostly negative' },
            { id: 3, text: '<i class="far fa-meh-blank"></i>' , value: 'Neutral' },
            { id: 2, text: '<i class="far fa-smile"></i>' , value: 'Mostly positive' },
            { id: 3, text: '<i class="far fa-grin-hearts"></i>' , value: 'Positive' },
        ]
    }, {
        name: 'relation',
        values: [
            // { id: 1, text: "Cause-Effect" , value: "Cause-Effect" },
            // { id: 1, text: "Component-Whole" , value: "Component-Whole" },
            // { id: 1, text: "Content-Container" , value: "Content-Container" },
            // { id: 1, text: "Entity-Destination" , value: "Entity-Destination" },
            // { id: 1, text: "Entity-Origin" , value: "Entity-Origin" },
            // { id: 1, text: "Instrument-Agency" , value: "Instrument-Agency" },
            // { id: 1, text: "Member-Collection" , value: "Member-Collection" },
            // { id: 1, text: "Message-Topic" , value: "Message-Topic" },
            // { id: 1, text: "Product-Producer", value: "Product-Producer" }
            { id: 1, text: "Cause" , value: "Cause" },
            { id: 1, text: "Component" , value: "Component" },
            { id: 1, text: "Content" , value: "Content" },
            { id: 1, text: "Destination" , value: "Destination" },
            { id: 1, text: "Origin" , value: "Origin" },
            { id: 1, text: "Agency" , value: "Agency" },
            { id: 1, text: "Member" , value: "Member" },
            { id: 1, text: "Message" , value: "Message" },
            { id: 1, text: "Producer", value: "Producer" }
        ]
    },

]
// CARDINAL 	cardinal value
// DATE 	date value
// EVENT 	event name
// FAC 	building name
// GPE 	geo-political entity
// LANGUAGE 	language name
// LAW 	law name
// LOC 	location name
// MONEY 	money name
// NORP 	affiliation
// ORDINAL 	ordinal value
// ORG 	organization name
// PERCENT 	percent value
// PERSON 	person name
// PRODUCT 	product name
// QUANTITY 	quantity value
// TIME 	time value
// WORK_OF_ART 	name of work of art

// Cause-Effect(CE): An event or object leads to an effect(those cancers were caused by radiation exposures)
// Instrument-Agency(IA): An agent uses an instrument(phone operator)
// Product-Producer(PP): A producer causes a product to exist (a factory manufactures suits)
// Content-Container(CC): An object is physically stored in a delineated area of space (a bottle full of honey was weighed) Hendrickx, Kim, Kozareva, Nakov, O S´ eaghdha, Pad ´ o,´ Pennacchiotti, Romano, Szpakowicz Task Overview Data Creation Competition Results and Discussion The Inventory of Semantic Relations (III)
// Entity-Origin(EO): An entity is coming or is derived from an origin, e.g., position or material (letters from foreign countries)
// Entity-Destination(ED): An entity is moving towards a destination (the boy went to bed)
// Component-Whole(CW): An object is a component of a larger whole (my apartment has a large kitchen)
// Member-Collection(MC): A member forms a nonfunctional part of a collection (there are many trees in the forest)
// Message-Topic(CT): An act of communication, written or spoken, is about a topic (the lecture was about semantics)
// OTHER: If none of the above nine relations appears to be suitable.

// document.onkeypress = (e => {
//     if (e.keyCode == 13) {
//         save()
//     }

// })

var cur_sent = 0
display_sent(sentences[cur_sent].text)

const API = 'https://api.ibex-app.io/'


const bottomLine = document.querySelector('div.bottom-line')

labels.forEach((labelGroup, ind) => {
    let labelGroupCont = document.createElement('div')
    labelGroupCont.setAttribute('ind', labelGroup.name)
    bottomLine.appendChild(labelGroupCont)
    if (ind == 0) { labelGroupCont.className = 'show' }

    // let labelCont = document.createElement('span')
    // labelCont.innerHTML = '«'
    // labelCont.className = 'prev'
    // labelCont.onclick = prev
    // labelGroupCont.appendChild(labelCont)

    labelGroup.values.forEach(label => {
        let labelCont = document.createElement('span')
        labelCont.setAttribute('data-id', label.value)
        labelCont.innerHTML = label.text
        labelGroupCont.appendChild(labelCont)

        labelCont.onclick = (e) => {
            // console.log(e.target.innerText)
            if (e.target.innerText == 'Select all') {
                selectAll()
                return
            }
            if (partOfSpeechMode) {
                

                saveTag(labelCont.getAttribute('data-id'))
                return
            }
            setMenu('nothing-selected')
        }
    })

    // labelCont = document.createElement('span')
    // labelCont.innerHTML = '»'
    // labelCont.className = 'next'
    // labelCont.onclick = next
    // labelGroupCont.appendChild(labelCont)
})

var active_menu = 'nothing-selected'
var all_menus = [...document.querySelectorAll('.bottom-line > div')]

const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

canvas.ontouchend = dehightlight
canvas.onmouseup = dehightlight
canvas.onclick = dehightlight

parrentCont.ontouchend = dehightlight
parrentCont.onmouseup = dehightlight
parrentCont.onclick = dehightlight

// canvas.onclick = console.log

let elll1, elll2

function drawRelation(el1, el2, color) {
    elll1 = el1 
    elll2 = el2
    // console.log(el1, el2, color)
    

    ctx.strokeStyle = color //'gray';//cols[2];
    ctx.lineWidth = 2;
    // ctx.lineCap = 'round';
    let startOffsetX, startOffsetY, endOffsetX, endOffsetY, el1OffsetX, el1OffsetY, el2OffsetX, el2OffsetY

    el1OffsetX = el1.parentElement.offsetLeft + el1.offsetLeft + 6
    el1OffsetY = el1.parentElement.offsetTop + el1.offsetTop 

    el2OffsetX = el2.parentElement.offsetLeft + el2.offsetLeft + 6 
    el2OffsetY = el2.parentElement.offsetTop + el2.offsetTop

    if(el1OffsetY < el2OffsetY){
        startOffsetX = el1OffsetX
        startOffsetY = el1OffsetY

        endOffsetX = el2OffsetX
        endOffsetY = el2OffsetY
    } else {
        startOffsetX = el2OffsetX
        startOffsetY = el2OffsetY

        endOffsetX = el1OffsetX
        endOffsetY = el1OffsetY
    }
    let heightDifference = endOffsetY - startOffsetY
    // console.log()
    ctx.beginPath();
    ctx.moveTo(startOffsetX, startOffsetY);
    
    ctx.bezierCurveTo(startOffsetX, 
        heightDifference ? (startOffsetY + heightDifference/2) : startOffsetY + 50, 
        endOffsetX, 
        heightDifference ? (endOffsetY - heightDifference/2) : endOffsetY + 50, 
        endOffsetX, endOffsetY );
    // ctx.lineTo(endOffsetX, endOffsetY);
    ctx.stroke();

}

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  
    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }
    else {
      cancelFullScreen.call(doc);
    }
}
  
const undo  = () => {
    if(tags && tags.length){
        let lastTag = tags[tags.length - 1]
        colIndex =  lastTag.colorIndex
        if(lastTag.labelGrup == 'relation' && lastTag.relation == 'end'){
            setMenu('relation', lastTag.label)
        } else {
            setMenu(lastTag.labelGrup)
        }
        tags.pop()
        orderTagsAndDrowUnderlines()
        hideemptylines()
        drawRelations()
    }
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }
  


window.addEventListener('resize', orderTagsAndDrowUnderlines);

setMenu('nothing-selected')