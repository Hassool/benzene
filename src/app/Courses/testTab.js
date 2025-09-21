const { default: mongoose } = require('mongoose');

const Courses = [
    {
        id : 1,
        title: "coure 1",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        thumbnail: "https://picsum.photos/400",
        category : "1as",
        teacher : "68c427c5899533e3f34daff2"
    },
    {
        id : 2,
        title: "coure 2",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        thumbnail: "https://picsum.photos/400",
        category : "2as",
        teacher : "68c427c5899533e3f34daff2"
    },
    {
        id : 3,
        title: "coure 3",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        thumbnail: "https://picsum.photos/400",
        category : "3as",
        teacher : "68c427c5899533e3f34daff2"
    },
    {
        id : 4,
        title: "coure 4",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        thumbnail: "https://picsum.photos/400",
        category : "2as",
        teacher : "1"
    },
    {
        id : 5,
        title: "coure 5",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        thumbnail: "https://picsum.photos/400",
        category : "other",
        teacher : "11"
    }
]


const Section = [
    {
        id : 1,
        title: "section 1-1",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        courseId: 1,
    },
    {
        id : 2,
        title: "section 2-1",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        courseId: 1,
    },
    {
        id : 3,
        title: "section 3-1",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod deserunt labore doloremque, reprehenderit deleniti quae enim aperiam consectetur sit, soluta in quia atque! Sint, perferendis molestiae odit reprehenderit nemo id!",
        courseId: 1,
    }
]

const Resource = [
    {
        id : 1,
        title: "recource 1",
        description: "description",
        sectionId: 1,
        type: "quiz",
        content: "",
        order: 1
    },
    {
        id : 2,
        title: "recource 2",
        description: "description",
        sectionId: 1,
        type: "video",
        content: "https://media.istockphoto.com/id/1413207061/video/road-traffic-in-delhi-roads.mp4?s=mp4-640x640-is&k=20&c=KnGos4ZVgHxZSV-zGAJk0mWsjR2kLGumoVcKI-PanEw=",
        order: 2
    },
    {
        id : 3,
        title: "recource 3",
        description: "description",
        sectionId: 1,
        type: "document",
        content: "./cv.pdf",
        order: 3
    },
    {
        id : 4,
        title: "recource 4",
        description: "description",
        sectionId: 1,
        type: "link",
        content: "http://localhost:3000/Courses",
        order: 4
    },
    {
        id : 5,
        title: "recource 5",
        description: "description",
        sectionId: 1,
        type: "image",
        content: "https://picsum.photos/400",
        order: 5
    },
]

const Quiz = [
    {
        id : 1,
        order : 1,
        rscID : 1, 
        Q : "chhal fi 3amri",
        Ss : [15,16,17],
        S : 17
    },
    {
        id : 2,
        order : 2,
        rscID : 1, 
        Q : "chhal fi 3amri",
        Ss : [15,16,17],
        S : 17
    },
    {
        id : 3,
        order : 3,
        rscID : 1, 
        Q : "chhal fi 3amri",
        Ss : [15,16,17],
        S : 17
    },
]

export {Courses , Section , Resource , Quiz} 