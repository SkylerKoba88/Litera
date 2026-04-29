-- Run once against your database, then rebuild + restart the server.

CREATE TABLE IF NOT EXISTS user_shelves (
  id         INT          NOT NULL AUTO_INCREMENT,
  user_id    INT          NOT NULL,
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_shelves_user (user_id),
  CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shelf_books (
  id         INT          NOT NULL AUTO_INCREMENT,
  shelf_id   INT          NOT NULL,
  book_id    INT UNSIGNED NOT NULL,
  added_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_shelf_book (shelf_id, book_id),
  KEY idx_sb_book (book_id),
  CONSTRAINT fk_sb_shelf FOREIGN KEY (shelf_id) REFERENCES user_shelves (id) ON DELETE CASCADE,
  CONSTRAINT fk_sb_book  FOREIGN KEY (book_id)  REFERENCES books         (id) ON DELETE CASCADE
);
