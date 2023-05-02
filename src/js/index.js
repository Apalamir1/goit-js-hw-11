import { createMarkup } from './createMarkup';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import LoadMoreBtn from './loadMoreBtn';
import { getRefs } from './getRefs';
import NewAPI from './API'
import { onScroll, onTopButton } from './scroll';
import { emptySearchMessage, noImagesFoundMessage, imagesFoundMessage, endOfSearchMessage } from './notify';

onScroll();
onTopButton();

let lightbox;
function runSimpleLightBox() {
    lightbox = new SimpleLightbox('.gallery .gallery__link', {
        captionsData: 'alt',
        captionDelay: 250,
    });

}

const newApiService = new NewAPI();
const refs = getRefs();

refs.searchField.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
    e.preventDefault();
    newApiService.query = e.currentTarget.searchQuery.value.trim();
    
    

    if (newApiService.query === '') {
        clearMarkup();
        emptySearchMessage();
        return;
        
    } 
        
        clearMarkup();
        newApiService.resetPage();
        runSimpleLightBox();
        fetchAll();
      
}

const loadMoreBtn = new LoadMoreBtn({
    selector: '.load-more',
    hidden: true,
});

loadMoreBtn.refs.button.addEventListener('click', onClickMoreBtn);

function onClickMoreBtn() {
    fetchAll();
}

async function fetchAll() {
    try {
        const data = await newApiService.fetchArticles();
        const totalPage = Math.ceil(data.totalHits / 40);

        loadMoreBtn.show();
        loadMoreBtn.disable();

        if (data.totalHits > 0) {
            loadMoreBtn.enable();
            runMarkup(data.hits);
            lightbox.refresh();
        }

        if (data.totalHits === 0) {
            loadMoreBtn.hide();
            noImagesFoundMessage();
        }

        if (newApiService.page === 2 && data.totalHits !== 0) {
            imagesFoundMessage(data.totalHits);
        }

        if (data.totalHits < 40) {
            loadMoreBtn.hide();
        }

        if (totalPage < newApiService.page && newApiService.page > 2) {
            loadMoreBtn.hide();
            endOfSearchMessage();
        }
    } catch (error) {
        
    }
}
function runMarkup(c) {
    refs.getGallery.insertAdjacentHTML('beforeend', createMarkup(c));
}

function clearMarkup() {
    refs.getGallery.innerHTML = '';
}

console.log(refs.getGalleryLink);
