export const PREDEFINED_MOODS = [
    { name: 'Happy', icon: 'fas fa-smile text-warning' },
    { name: 'Sad', icon: 'fas fa-frown text-primary' },
    { name: 'Excited', icon: 'fas fa-laugh-beam text-warning' },
    { name: 'Angry', icon: 'fas fa-angry text-danger' },
    { name: 'Loved', icon: 'fas fa-heart text-danger' },
    { name: 'Tired', icon: 'fas fa-tired text-info' },
    { name: 'Peaceful', icon: 'fas fa-peace text-success' },
    { name: 'Bored', icon: 'fas fa-meh text-secondary' },
    { name: 'Cool', icon: 'fas fa-glasses text-dark' },
    { name: 'Focused', icon: 'fas fa-brain text-purple' },
    { name: 'Creative', icon: 'fas fa-paint-brush text-info' },
    { name: 'Sick', icon: 'fas fa-thermometer-half text-success' }
];

export const getMoodIcon = (moodStr) => {
    if (!moodStr) return null;
    const cleanMood = moodStr.replace('Feeling ', '').trim();
    const found = PREDEFINED_MOODS.find(m => m.name.toLowerCase() === cleanMood.toLowerCase());
    return found ? found.icon : null;
};
