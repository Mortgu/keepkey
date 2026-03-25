import { Queue } from 'bullmq';

const queue = new Queue('foo');

async function addJobs() {
    await queue.add('myJobName', { foo: 'bar' });
    await queue.add('myJobName', { foo: 'baz' });
}

await addJobs();
