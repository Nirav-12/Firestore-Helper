/**
 * @description Methods of store data onto Firestore.
 */

import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/storage';

/**
 * @description Function to add new record in firebase.firestore().
 * @param collection - Name of the collection where we want to add data.
 * @param data - data object that we want to add.
 */

export const addRecord = (collection, data) => {
  data.created_at = firebase.firestore.Timestamp.now();

  return new Promise(function (resolve, reject) {
    let ref =
      data.id === undefined || data.id === null
        ? firebase.firestore().collection(collection).doc()
        : firebase.firestore().collection(collection).doc(data.id);
    data.id = ref.id;
    ref
      .set(data)
      .then((snapshot) => {
        var res = {
          id: data.id,
          ...snapshot,
        };
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to edit record in firebase.firestore().
 * @param collection - Name of the collection where we want to edit data.
 * @param id - id of the object that we want to edit.
 * @param data - data object that we want to edit.
 */

export const editRecord = (collection, id, data) => {
  data.updated_at = firebase.firestore.Timestamp.now();

  return new Promise(function (resolve, reject) {
    let ref = firebase.firestore().collection(collection).doc(id);
    ref
      .update(data)
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to Delete record from firebase.firestore().
 * @param collection - Name of the collection where we want to edit data.
 * @param id - id of the object that we want to edit.
 * @param data - data object that we want to edit.
 */

export const deleteRecord = (collection, id) => {
  return new Promise(function (resolve, reject) {
    let ref = firebase.firestore().collection(collection).doc(id);
    ref
      .delete()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to soft Delete record from firebase.firestore(). Record will be still in the database but with value deleted = true
 * @param collection - Name of the collection where we want to edit data.
 * @param id - id of the object that we want to edit.
 */

export const deleteRecordSoft = (collection, id) => {
  let data = {};
  data.updated_at = firebase.firestore.Timestamp.now();
  data.updated_by = firebase.auth().currentUser.uid;
  data.deleted = true;

  return new Promise(function (resolve, reject) {
    let ref = firebase.firestore().collection(collection).doc(id);
    ref
      .update(data)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to GET Single record for a Collection based on id from firebase.firestore().
 * @param collection - Name of the collection where we want to GET data.
 * @param id - document id of collection where we want to GET data.
 */

export const getRecord = (collection, id) => {
  return new Promise(function (resolve, reject) {
    let ref = firebase.firestore().collection(collection).doc(id);
    ref
      .get()
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to GET All record for a Collection from firebase.firestore().
 * @param collection - Name of the collection where we want to GET data.
 */

export const getRecordAll = (collection) => {
  return new Promise(function (resolve, reject) {
    let ref = firebase.firestore().collection(collection);
    ref
      .get()
      .then((snapshot) => {
        resolve(snapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to GET All record with specic query, order and pagination for a Collection from firebase.firestore().
 * @param collection - Name of the collection where we want to GET data.
 * @param queryArray - Query that will perform on perticular collection. It contais Array or Array (Array<Array>) to have multiple queries.
 *                     Every inner Array must have 3 parameters. ["key","operation","compare_with"]
 * @param orderBy - Order by "asc" or "desc" by perticular column.
 * @param startAfter - Used for paginations. Provide last page or document in this. Query will get data after this record
 * @param limit - Provide how many number of record in the request.
 */

export const getRecordWithQuery = (
  collection,
  queryArray: Array<Array> = null,
  orderBy: Array = null,
  startAfter = null,
  limit = null
) => {
  // eslint-disable-next-line complexity
  return new Promise(function (resolve, reject) {
    let ref = firebase.firestore().collection(collection);
    let queryRef = ref;

    if (queryArray !== null) {
      queryArray.forEach((query) => {
        queryRef = queryRef.where(query[0], query[1], query[2]);
      });
    }

    if (orderBy !== null) {
      if (typeof orderBy[1] === undefined) {
        orderBy[1] = 'asc';
      }
      queryRef = queryRef.orderBy(orderBy[0], orderBy[1]);
    }

    if (startAfter !== null) {
      queryRef = queryRef.startAfter(startAfter);
    }

    if (limit !== null) {
      queryRef = queryRef.limit(limit);
    }

    queryRef
      .get()
      .then((snapshot) => {
        // console.log(snapshot);
        resolve(snapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Function to Store image on storage of Firebase.
 * @param collection - Name of the collection where we want to store image.
 * @param userId - Id of user for give reference id on storage.
 * @param uri - URI of image which you want to store on storage.
 * Note :- platform iOS -> uri & plaform android -> path
 */
export const storeImageOnFirestore = (collection, userId, uri) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async function (resolve, reject) {
    const response = await fetch(uri);
    const blob = await response.blob();
    var ref = firebase.storage().ref(collection).child(userId);
    ref
      .put(blob)
      .then(() => {
        ref
          .getDownloadURL()
          .then((snap) => {
            resolve(snap);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
