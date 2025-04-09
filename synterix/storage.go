package synterix

import (
	"go.etcd.io/bbolt"
	"log"
	"path/filepath"
	"time"
)

const (
	BucketName = "Settings"
)

func GetValue(key string) (string, error) {
	var value []byte
	err := execute(func(db *bbolt.DB) error {
		return db.View(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(BucketName))
			value = b.Get([]byte(key))
			return nil
		})
	})
	return string(value), err
}

func SetValue(key string, value string) error {
	return execute(func(db *bbolt.DB) error {
		return db.Update(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(BucketName))
			err := b.Put([]byte(key), []byte(value))
			return err
		})
	})
}

func GetAll() (map[string]string, error) {
	var result = make(map[string]string)
	err := execute(func(db *bbolt.DB) error {
		return db.View(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(BucketName))
			c := b.Cursor()
			for k, v := c.First(); k != nil; k, v = c.Next() {
				result[string(k)] = string(v)
			}
			return nil
		})
	})
	return result, err
}

func SetAll(values map[string]string) error {
	return execute(func(db *bbolt.DB) error {
		return db.Update(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(BucketName))
			for k, v := range values {
				err := b.Put([]byte(k), []byte(v))
				if err != nil {
					return err
				}
			}
			return nil
		})
	})
}

func InitDB() {
	err := execute(func(db *bbolt.DB) error {
		err := db.Update(func(tx *bbolt.Tx) error {
			_, err := tx.CreateBucketIfNotExists([]byte(BucketName))
			if err != nil {
				return err
			}
			return err
		})
		if err != nil {
			log.Fatal(err)
		}
		m := map[string]string{
			"centerTunnelUrl": "",
			"theme":           "dark",
			"token":           "",
			"proxies":         "[]",
		}
		err = db.View(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(BucketName))
			c := b.Cursor()
			for k, v := c.First(); k != nil; k, v = c.Next() {
				m[string(k)] = string(v)
			}
			return nil
		})
		err = db.Update(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(BucketName))
			for k, v := range m {
				err := b.Put([]byte(k), []byte(v))
				if err != nil {
					return err
				}
			}
			return nil
		})
		if err != nil {
			log.Fatal(err)
		}
		return err
	})
	if err != nil {
		log.Fatal(err)
	}
}

func execute(invoker func(db *bbolt.DB) error) error {
	appDataDir, err := getAppDataPath("synterix")
	if err != nil {
		return err
	}
	dbPath := filepath.Join(appDataDir, "storage.db")
	db, err := bbolt.Open(dbPath, 0600, &bbolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return err
	}
	defer db.Close()
	return invoker(db)
}
