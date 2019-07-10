'use strict';

const printReceipt = (inputs) => {
    const itemSummary = calculateItemSummary(inputs)
    console.log(buildReceiptByItemSummary(itemSummary))
}

const calculateItemSummary = (inputs) => {
    const allItems = loadAllItems()
    const itemCount = calculateItemCount(inputs)
    const itemSummary = []
    for (let key in itemCount) {
        for(let i = 0 ;i < allItems.length; i ++){
            if (key === allItems[i]['barcode']) {
                let item = {}
                item['barcode'] = allItems[i]['barcode']
                item['name'] = allItems[i]['name']
                item['price'] = allItems[i]['price']
                item['unit'] = allItems[i]['unit']
                item['count'] = itemCount[key]
                itemSummary.push(item)
                break
            }
        }
    }
    return itemSummary
}

const buildReceiptByItemSummary = (itemSummary) => {
    const itemSummaryByPromotion = calculateTotalByPromotion(itemSummary)
    let receipt = `***<没钱赚商店>收据***` + '\n'
    for(let i = 0; i < itemSummary.length; i ++) {
        receipt += `名称：${itemSummary[i]['name']}，数量：${itemSummary[i]['count']}${itemSummary[i]['unit']}，单价：${toDecimal2(itemSummary[i]['price'])}(元)，小计：${toDecimal2(itemSummaryByPromotion[i]['price']*itemSummaryByPromotion[i]['count'])}(元)` + '\n'
    }
    receipt += `----------------------
总计：${calculateTotal(itemSummaryByPromotion)}(元)
节省：${toDecimal2(calculateTotal(itemSummary) - calculateTotal(itemSummaryByPromotion))}(元)
**********************`
    return receipt
}

const calculateItemCount = (inputs) => {
    const itemCount = {}
    for(let i = 0; i < inputs.length; i++) {
        let item = inputs[i]
        if (inputs[i].indexOf('-') > 0) {
            item = inputs[i].substring(0, inputs[i].indexOf('-'))
            let count = parseFloat(inputs[i].substring(inputs[i].indexOf('-') + 1))
            if (!itemCount[item]) {
                itemCount[item] = count
            } else {
                itemCount[item] += count
            }
        } else {
            if (!itemCount[item]) {
                itemCount[item] = 1
            } else {
                itemCount[item] ++
            }
        }

    }
    return itemCount
}

const calculateTotalByPromotion = (itemSummary) => {
    const promotions = loadPromotions()
    let itemSummaryByPromotion = JSON.parse(JSON.stringify(itemSummary))
    for (let i = 0; i < promotions.length; i ++) {
        let promotion = promotions[i]
        if (promotion['type'] === 'BUY_TWO_GET_ONE_FREE') {
            for (let j = 0; j < itemSummaryByPromotion.length; j ++) {
                if (promotion['barcodes'].indexOf(itemSummaryByPromotion[j]['barcode']) > -1) {
                    itemSummaryByPromotion[j]['count'] =  Math.ceil(itemSummaryByPromotion[j]['count']*2/3)
                }
            }
        }
    }
    return itemSummaryByPromotion
}

const calculateTotal = (itemSummary) => {
    let totalPrice = 0
    for(let i = 0; i < itemSummary.length; i ++) {
        totalPrice += itemSummary[i]['price']*itemSummary[i]['count']
    }
    return toDecimal2(totalPrice)
}

const toDecimal2 = (x) => {
    let f = parseFloat(x)
    if (isNaN(f)) {
        return false
    }
    f = Math.round(x*100)/100
    let s = f.toString()
    let rs = s.indexOf('.')
    if (rs < 0) {
        rs = s.length
        s += '.'
    }
    while (s.length <= rs + 2) {
        s += '0'
    }
    return s
}