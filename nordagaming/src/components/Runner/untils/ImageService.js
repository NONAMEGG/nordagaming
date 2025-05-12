// services/ImageService.js
import { getCluster } from "@/graph/clustersAPI";

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
            const response = await getCluster();
            
            if (!response?.cluster?.areas) {
                console.warn('Unexpected response structure:', response);
                return mockImages;
            }
                        
            return response.cluster.areas
                .filter(area => area.imageCID?.length > 0)
                .map((area, index) => ({
                id: index + 1,
                url: `${area.imageCID[0]}`
                }));
            } catch (error) {
                console.error('Failed to fetch cluster data:', error);
                return mockImages;
            }
    }
}