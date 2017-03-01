import { GafferUiPage } from './app.po';

describe('gaffer-ui App', function() {
  let page: GafferUiPage;

  beforeEach(() => {
    page = new GafferUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
