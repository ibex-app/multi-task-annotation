
    var colIndex = 1
    var cols = ["black", "#bf501f", "#f59c34", "#89a7c6", "#7bc597", "#8d639a", "#8d639a", "#e4a774", "#828687", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick"]


    var drowBorders = () => {

        return

        words.forEach(wordInfo => {
            wordInfo.dom.style.paddingLeft = ''
            wordInfo.dom.style.paddingRight = ''
        })
        words.forEach((wordInfo, index) => {
            if (wordInfo.borders.length == 0) return
            wordInfo.borders = wordInfo.borders.sort((a, b) => a.layer > b.layer)
            let topBorder = wordInfo.borders[wordInfo.borders.length - 1]
            if (topBorder.first && words[index - 1]) {
                words[index - 1].dom.style.paddingRight = (3 + topBorder.layer * 3.3) + 'px'
            }
            if (topBorder.last && words[index + 1]) {
                words[index + 1].dom.style.paddingLeft = (3 + topBorder.layer * 3.3) + 'px'
            }
        })
        words.forEach(wordInfo => {
            if (wordInfo.borders.length == 0) return
            wordInfo.dom.style.zIndex = 100 + wordInfo.borders.length
            wordInfo.borders = wordInfo.borders.sort((a, b) => a.layer > b.layer)
            let lastLayer = wordInfo.borders[wordInfo.borders.length - 1].layer
            let existingLayers = wordInfo.borders.map(b => b.layer)
            let left = 4
            for (let i = 1; i <= lastLayer; i++) {
                if (existingLayers.indexOf(i) == -1) {
                    left += 3
                    wordInfo.borders.push({ colorIndex: 0, first: true, last: true, layer: i })
                }
            }
            left = left > 8 ? 8 : left
            wordInfo.borders = wordInfo.borders.sort((a, b) => a.layer > b.layer)
            wordInfo.dom.style.boxShadow = wordInfo.borders.map(getBorderString).join(' , ')
            wordInfo.dom.style.paddingLeft = left + 'px'
            wordInfo.dom.style.paddingRight = left + 'px'
        })
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
            
            if(ind == 0) {
                wordInfo.dom.firstChild.setAttribute('style', 'border-bottom-left-radius: 5px; border-top-left-radius: 5px;')
            }
            if(ind == selected.length - 1) { 
                wordInfo.dom.firstChild.setAttribute('style', wordInfo.dom.firstChild.getAttribute('style') + ' border-bottom-right-radius: 5px; border-top-right-radius: 5px;')
            }
        })
        
        partOfSpeechMode = selected.length > 0

        if(selected.length == 0) setMenu('nothing-selected')
        if(selected.length > 0 & selected.length < 3) setMenu('named-entity')
        if(selected.length > 3) setMenu('topic')
    }
    

    var onmousedown_ = (e) => {
        if (e.touches && e.touches.length === 2) return
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
        if (e.touches && e.touches.length === 2) return
        var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
        var touch = evt.touches[0] || evt.changedTouches[0];
        el = document.elementFromPoint(touch.pageX, touch.pageY)

        currentTarget = el.getAttribute("index") ? el : el.parentElement
        onmouseenter_(e, currentTarget)
    }

    var onmouseenter_ = (e, currentTarget) => {
        if (e.touches && e.touches.length === 2) return
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

    var cont = document.querySelector('div.sent')
    
    const dehightlight = (e) => {
        
        if(e.target.className == 'sent'){
            startIndex = -1
            endIndex = -1

            highlight()
        }
    }

    cont.ontouchend = dehightlight
    cont.onmouseup = dehightlight

    var cntrlIsPressed = false;

    document.body.addEventListener('keydown', (e) => { if (17 == e.which) cntrlIsPressed = true });

    document.body.addEventListener('keyup', (e) => cntrlIsPressed = false );

    var startSelection = false
    var tags = []
    var tagId = tags.length
    var max_layers

    cont.ontouchstart =  (event) => {
        if (event.touches.length === 2) {
            event.preventDefault()
            lastTouchY = event.touches[0].clientY;
        }
    }

    cont.ontouchmove = (event) => {
        if (event.touches.length === 2){
            event.preventDefault()

            const delta = lastTouchY - event.touches[0].clientY;
            lastTouchY = event.touches[0].clientY;
    
            cont.scrollTop += delta;
        }
    }

    const display_sent = (text) => {

    
        startSelection = false
        cont.innerHTML = ''
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


        drowBorders()
        tags = []
        tagId = tags.length
    }

    var orderTags = () => {
        let allTaggedWords = [].concat.apply([], tags.map(tag => tag.words))
        
        countOfWords = allTaggedWords.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
        
        max_layers = Array.from(countOfWords, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)[0].value
        words.forEach(wordInfo => {
            wordInfo.occupiedLayers = []
            wordInfo.dom.innerHTML = '<span>' + wordInfo.text + '</span>'
            for (let layer_index = 0; layer_index < max_layers; layer_index++) {
                let span = document.createElement('span')
                wordInfo.dom.appendChild(span)
            }
        })

        tags.forEach(tag => {
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

                span = wordInfo.dom.querySelector('span:nth-child(' + (avaliableLayer + 1) + ')')
                span.style.border = '2.5px solid ' + cols[tag.colorIndex]
                span.style.background = cols[tag.colorIndex]
                if (wordInd == 0) {
                    span.classList.add('first')
                    // span.innerHTML = '<i style="color:' + cols[tag.colorIndex] + '">Entity # 12</i>'
                    span.innerHTML = '<i style="">' + tag.label + '</i>'
                }
                if (wordInd == tagWords.length - 1) span.classList.add('last')
                wordInfo.occupiedLayers.push(avaliableLayer)
            })
        })

        return
    }
    
    var lines

    var hideemptylines = () => {
        cont = document.querySelector('div.sent')
        let contWidth 
        var style = window.getComputedStyle(cont, null);
        contWidth = style.getPropertyValue("width");

        // contWidth = cont.offsetWidth
        lines = [[]]
        offset = 0
        words.forEach(wordInfo => {
            if (offset + wordInfo.dom.offsetWidth <= contWidth - 200) {
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
                } else {
                    break
                }
            }

        })
    }

    const saveAndNext = async () => {
        if(cur_sent + 1 >= sentences.length) return
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

    var save = (label) => {
        selectedIndexes = words.filter(wordInfo => wordInfo.selecting).map(wordInfo => wordInfo.index)
        if (selectedIndexes.length !== 0) tags.push({ id: tagId, label: label, colorIndex: colIndex, words: selectedIndexes })

        tags.forEach(tag => tag.drown = false)
        // words.forEach(wordInfo => {
        //     wordInfo.selecting = false
        //     wordInfo.borders = []
        // })

        // dehightlight({target:{className: 'sent'}})
        orderTags()
        drowBorders()
        hideemptylines()
        colIndex++
        tagId++
    }

    
    
    
    var sentences = [
        {id:1, text: `Conservative and opposition MPs are demanding answers from Boris Johnson over claims he attended a drinks event in the No 10 garden during lockdown. Labour's deputy leader Angela Rayner said that if he was there, and he lied about it, his position is "untenable". While Liberal Democrat leader Sir Ed Davey said the PM should resign now. Mr Johnson will appear at Prime Minister's Questions later - his first public appearance since details of the May 2020 event emerged. The prime minister has so far declined to say whether he attended the gathering, but witnesses have told the BBC both he and his wife were among 30 people at the drinks held on the 20 May 2020. The BBC has been told that Mr Johnson will not make a separate statement on parties in the House of Commons but a senior government source didn't rule out him making some remarks at the start of Prime Minister's Questions.`},
        {id:1, text: "სამხრეთ აფრიკის პარლამენტში ხანძარი გაჩნდა. ცეცხლი შენობის სახურავიდან ამოდიოდა და კვამლი კილომეტრების მოშორებით ჩანდა. ინფორმაციას Reuters ავრცელებს. ინფრასტრუქტურის მინისტრმა პატრიცია დე ლილემ ჟურნალისტებს განუცხადა, რომ ხანძარი ლოკალიზებულია. მისი თქმით, დამწვარია ეროვნული ასამბლეის დარბაზი და ხანძარი მოედო სხვა ტერიტორიასაც. პირველადი ინფორმაციით, ხანძარი ერთ-ერთ ოფისში გაჩნდა და სპორტული დარბაზისკენ გავრცელდა. დე ლილის თქმით, ხანძრის შედეგად დაშავებულების შესახებ ინფორმაცია არ ვრცელდება. ხელისუფლების განცხადებით, მეხანძრეები სიტუაციას აკონტროლებენ. ხანძრის გამომწვევი მიზეზი ჯერჯერობით უცნობია. სამხრეთ აფრიკის პარლამენტში ხანძარი გაჩნდა. ცეცხლი შენობის სახურავიდან ამოდიოდა და კვამლი კილომეტრების მოშორებით ჩანდა. ინფორმაციას Reuters ავრცელებს. ინფრასტრუქტურის მინისტრმა პატრიცია დე ლილემ ჟურნალისტებს განუცხადა, რომ ხანძარი ლოკალიზებულია. მისი თქმით, დამწვარია ეროვნული ასამბლეის დარბაზი და ხანძარი მოედო სხვა ტერიტორიასაც. პირველადი ინფორმაციით, ხანძარი ერთ-ერთ ოფისში გაჩნდა და სპორტული დარბაზისკენ გავრცელდა. დე ლილის თქმით, ხანძრის შედეგად დაშავებულების შესახებ ინფორმაცია არ ვრცელდება. ხელისუფლების განცხადებით, მეხანძრეები სიტუაციას აკონტროლებენ. ხანძრის გამომწვევი მიზეზი ჯერჯერობით უცნობია."},
        {id:1, text: "ინტენსიური თოვის და დაბალი ტემპერატურის გამო, შიდასახელმწიფოებრივი მნიშვნელობის გომი-საჩხერე-ჭიათურა-ზესტაფონის საავტომობილო გზის კმ18-კმ40 მონაკვეთზე, აკრძალულია მისაბმელიანი და ნახევრადმისაბმელიანი ავტოტრანსპორტის მოძრაობა, ხოლო დანარჩენი სახის ავტოტრანსპორტის მოძრაობა თავისუფალია. საავტომობილო გზების დეპარტამენტის ინფორმაციით, გზის დანარჩენ მონაკვეთზე ავტოტრანსპორტის მოძრაობა თავისუფალია."},
        {id:1, text: "When you need to annotate a word or a phrase, you'll use Tags to say what the annotation is. Examples of tags are Person, Location, Object, Noun etc. You can use any tags in any language. When you need to annotate a word or a phrase, you'll use Tags to say what the annotation is. Examples of tags are Person, Location, Object, Noun etc. You can use any tags in any language."}
    ] 
    
    var next = () => {
        let menuLabels = labels.map(l => l.name)
        let curentMenuIndex = menuLabels.indexOf(active_menu)
        
        if(curentMenuIndex + 1 < all_menus.length){

            active_menu = menuLabels[curentMenuIndex + 1]
            setMenu(active_menu)
        } 

        all_menus.forEach(menu => menu.setAttribute('class', menu.getAttribute('ind') == active_menu ? 'show' : ''))
    }
    
    var prev = () => {
        let menuLabels = labels.map(l => l.name)
        let curentMenuIndex = menuLabels.indexOf(active_menu)

        if(curentMenuIndex - 1 >= 0){
            active_menu = menuLabels[curentMenuIndex - 1]
            setMenu(active_menu)
        } 

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

    const setMenu = (menuName) => {
        all_menus.forEach(menu => menu.setAttribute('class', menu.getAttribute('ind') == menuName ? 'show' : ''))
        document.querySelector('.label-title').innerText = menuName.replace('-', ' ')
    }
    // document.getElementById('next').addEventListener("click", next)
    // document.getElementById('prev').addEventListener("click", prev)
    
    const labels = [
        {
            name: 'nothing-selected',
            values: [
                {id:1, text: "Select all"},
            ]
        },
        {
            name: 'topic',
            values: [
                {id:1, text: "Anti west"},
                {id:2, text: "Pro-kremlian"},
                {id:3, text: "Hate speech"},
                {id:1, text: "Border"},
                {id:2, text: "Prisoners"},
                {id:3, text: "Military"},
                {id:3, text: "Terorism"},
                {id:3, text: "Gender"},
                {id:3, text: "Anti LGBTQ"},
            ]
        },
        {
            name: 'named-entity',
            values: [
                {id:6, text: "Person"},
                {id:7, text: "Organization"},
                {id:8, text: "Event"},
                {id:9, text: "Location"},
                {id:10, text: "Hate speech target"},
                {id:6, text: "Person"},
                {id:7, text: "Organization"},
                {id:8, text: "Event"},
                {id:9, text: "Location"},
                {id:10, text: "Hate speech target"},
            ]
        },
        {
            name: 'sentiment',
            values: [
                {id:1, text: "Negative"},
                {id:2, text: "Mostly negative"},
                {id:3, text: "Neutral"},
                {id:2, text: "Mostly positive"},
                {id:3, text: "Positive"},
            ]
        },{
            name: 'relation',
            values: [
                {id:1, text: "Cause-Effect"},
                {id:1, text: "Component-Whole"},
                {id:1, text: "Content-Container"},
                {id:1, text: "Entity-Destination"},
                {id:1, text: "Entity-Origin"},
                {id:1, text: "Instrument-Agency"},
                {id:1, text: "Member-Collection"},
                {id:1, text: "Message-Topic"},
                {id:1, text: "Product-Producer"}
            ]
        },
        
    ]

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
        if(ind == 0) {labelGroupCont.className = 'show'}
        
        // let labelCont = document.createElement('span')
        // labelCont.innerHTML = '«'
        // labelCont.className = 'prev'
        // labelCont.onclick = prev
        // labelGroupCont.appendChild(labelCont)

        labelGroup.values.forEach(label => {
            let labelCont = document.createElement('span')
            labelCont.setAttribute('data-id', label.id)
            labelCont.innerHTML = label.text
            labelGroupCont.appendChild(labelCont)

            labelCont.onclick = (e) => {
                console.log(e.target.innerText)
                if(e.target.innerText == 'Select all') {
                    selectAll()
                    return
                }
                if(partOfSpeechMode){
                    save(e.target.innerText)
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
