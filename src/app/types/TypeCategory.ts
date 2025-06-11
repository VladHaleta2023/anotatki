type TypeTopic = {
    id: string;
    title: string;
}

export type TypeCategory = {
    id: string;
    name: string;
    topics: TypeTopic[];
}