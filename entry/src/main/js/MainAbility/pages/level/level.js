import router from '@system.router';

export default {
    launch(difficulty) {
        router.replace({
            uri: '/pages/index/index',
            params: {
                selectedLevel: difficulty
            }
        });
    }
}