export const handler = async event => {
    //console.log("Request:", JSON.stringify(event, undefined, 2));

    const jokeArray = [
        'What do you call an Orc on a bike?<br />A Mordorcyclist.',
        'Why can\'t a bicycle stand up on its own?<br />Because it\'s too tired!',
        'What\'s the hardest part of learning to ride a bike?<br />The pavement.',
        'Life is like riding a bike!<br />In order to keep your balance you must keep moving.',
        'I don\'t ride a bike to add days to my life.<br />I ride a bike to add life to my days!',
        'I asked God for a bike, but I know God doesn\'t work that way.<br />So I stole a bike and asked for forgiveness.',
    ];
    const randomJoke = jokeArray[Math.floor(Math.random() * jokeArray.length)];

    // return joke
    return sendResponse(200, randomJoke);
};

const sendResponse = (status: number, body: string) => {
    var response = {
        statusCode: status,
        headers: {
            'Content-Type': 'text/html',
            // Don't use '*' for production environments
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
    return response;
};