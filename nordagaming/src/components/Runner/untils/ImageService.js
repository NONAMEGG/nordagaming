// services/ImageService.js

export default {
    async fetchCoinImages() {
        // Заглушка для GraphQL запроса
        const mockImages = [
            { id: 1, url: 'https://avatars.mds.yandex.net/i?id=47da973101d367f0923724c11e45c8aa35b96886-5879932-images-thumbs&n=13' },
            { id: 2, url: 'https://avatars.mds.yandex.net/i?id=60cb4779afbefee37775fa1ef60e36be1940fd78-9181740-images-thumbs&n=13' },
            { id: 3, url: 'https://avatars.mds.yandex.net/i?id=5b4e346ad460510d5e7449b1e4b98156daf3a88c-4593412-images-thumbs&n=13' },
            { id: 4, url: 'https://avatars.mds.yandex.net/i?id=b3b9754ed36fae7968b1192b67f73fa0cdb85c37-10878220-images-thumbs&n=13' },
            { id: 5, url: 'https://avatars.mds.yandex.net/i?id=f40a772e4c3e9b1618a2eeaa3169923837c1a9df-5234839-images-thumbs&n=13' },
            { id: 6, url: 'https://avatars.mds.yandex.net/i?id=f40a772e4c3e9b1618a2eeaa3169923837c1a9df-5234839-images-thumbs&n=13' },
            { id: 7, url: 'https://avatars.mds.yandex.net/i?id=60cb4779afbefee37775fa1ef60e36be1940fd78-9181740-images-thumbs&n=13' },
            { id: 8, url: 'https://avatars.mds.yandex.net/i?id=60cb4779afbefee37775fa1ef60e36be1940fd78-9181740-images-thumbs&n=13' },
            { id: 9, url: 'https://avatars.mds.yandex.net/i?id=60cb4779afbefee37775fa1ef60e36be1940fd78-9181740-images-thumbs&n=13' },
            { id: 10, url: 'https://avatars.mds.yandex.net/i?id=60cb4779afbefee37775fa1ef60e36be1940fd78-9181740-images-thumbs&n=13' },
            { id: 11, url: 'https://avatars.mds.yandex.net/i?id=60cb4779afbefee37775fa1ef60e36be1940fd78-9181740-images-thumbs&n=13' },
        ];

        try {
            const CLUSTER_ID = "111";
            const query = `
                query GetClusterImages($id: ID!) {
                cluster(id: $id) {
                    areas {
                    imageCID
                    }
                }
                }
            `;

            const url = new URL('https://api.thegraph.com/subgraphs/name/jsvirin/the-wall');
            url.searchParams.set('query', query);
            url.searchParams.set('variables', JSON.stringify({ id: CLUSTER_ID }));

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { data } = await response.json();
            
            const images = [];
            let idCounter = 1;

            data.cluster.areas.forEach(area => {
                if(area.imageCID?.length > 0) {
                images.push({
                    id: idCounter++,
                    url: `https://thewall.global/api/download/${area.imageCID[0]}`
                });
                }
            });

            return images;

        } catch (error) {
            console.error('Error fetching cluster images:', error);
            return mockImages;
        }
    }
}