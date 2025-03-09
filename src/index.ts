import AWSLambda from 'aws-lambda'
import * as line from '@line/bot-sdk'
// import * as dotenv from 'dotenv'
// import path from 'path'

const LINE_EMOJI_PRODUCT_ID = '5ac1bfd5040ab15980c9b435'
const LINE_EMOJI_MAX_NUMBER = 10
const LINE_STICKER_PACKAGE_ID = '11537'
const LINE_STICKER_ID = '52002737'
const LINE_ICON_URL_MYSELF = encodeURI('https://raw.githubusercontent.com/KyleChang95/LINE-Development/main/image/line_icon.png')

// Create LINE emoji list
const createEmojiList = (): { index: number; productId: string; emojiId: string; }[] => {
    const emojiList: { index: number; productId: string; emojiId: string; }[] = []
    
    while (emojiList.length < LINE_EMOJI_MAX_NUMBER) {
        emojiList.push({
            index: emojiList.length,
            productId: LINE_EMOJI_PRODUCT_ID,
            emojiId: (emojiList.length + 1).toString().padStart(3, '0')
        })
    }

    return emojiList
}

// Create message list
const createMessageList = (): line.Message[] => {
    const emojiList = createEmojiList()

    // Create message list
    return [
        // Text message
        {
            type: 'text',
            text: 'Text message'
        },
        // Text message with LINE emoji
        {
            type: 'text',
            text: ''.padEnd(LINE_EMOJI_MAX_NUMBER, '$'),
            emojis: emojiList
        },
        // Sticker message
        {
            type: 'sticker',
            packageId: LINE_STICKER_PACKAGE_ID,
            stickerId: LINE_STICKER_ID
        },
        // Image message
        {
            type: 'image',
            originalContentUrl: LINE_ICON_URL_MYSELF,
            previewImageUrl: LINE_ICON_URL_MYSELF
        }
    ] as line.Message[]
}

export const handler = async (event: AWSLambda.APIGatewayEvent) => {
    console.debug(event)

    // Load environment variables
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN!
    const channelSecret = process.env.LINE_CHANNEL_SECRET!
    const userIDMyself = process.env.LINE_USER_ID_MYSELF!

    // Create LINE SDK client
    const lineClient = new line.Client({
        channelAccessToken: channelAccessToken,
        channelSecret: channelSecret
    })

    const eventBody = JSON.parse(event.body!)

    if (eventBody.destination == null) {
        await lineClient.pushMessage(userIDMyself, {
            type: 'text',
            text: eventBody.message
        })
    } else {
        const webhookEvent = eventBody as line.WebhookRequestBody
        for (const event of webhookEvent.events) {
            console.log(JSON.stringify(event))
            try {
                if (event.type === 'message') {
                    // Reply message to user
                    await lineClient.replyMessage(event.replyToken, {
                        type: 'text',
                        text: `Reply: ${JSON.stringify(event.message)}`
                    })
                } else {
                    // Push message to me
                    await lineClient.pushMessage(userIDMyself, {
                        type: 'text',
                        text: `Push: ${JSON.stringify(event)}`
                    })          
                }
            } catch (error) {
                console.error(error)
            }
        }
    }

    return {
        statusCode: 200,
        body: 'OK'
    }
}

// dotenv.config({ path: path.resolve(__dirname, '.env') })

// const body = {
//     message: 'Hello, LINE!'
// }

// const event = {
//     body: JSON.stringify(body)
// }

// handler(event as AWSLambda.APIGatewayEvent)