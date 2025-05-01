// services/ImageService.js
import { GraphQLClient } from 'graphql-request';


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

        // try {
        //     const CLUSTER_ID = "111";
            
        //     const client = new GraphQLClient(
        //       'https://graph.nordavind.ru/subgraphs/name/the-wall-polygon',
        //       {
        //         headers: {
        //           'Content-Type': 'application/json',
        //           'Accept': 'application/json',
        //         }
        //       }
        //     );
      
        //     const query = `
        //       query GetClusterImages($id: ID!) {
        //         cluster(id: $id) {
        //           areas {
        //             imageCID
        //           }
        //         }
        //       }
        //     `;
      
        //     const data = await client.request(query, { id: CLUSTER_ID });
            
        //     return data.cluster.areas
        //       .filter(area => area.imageCID?.length > 0)
        //       .map((area, index) => ({
        //         id: index + 1,
        //         url: `https://thewall.global/api/download/${area.imageCID[0]}`
        //       }));
      
        // } catch (error) {
        //     console.error('GraphQL Error:', error.response?.errors || error.message);
        //     return mockImages;
        // }
        return mockImages;
    }
}